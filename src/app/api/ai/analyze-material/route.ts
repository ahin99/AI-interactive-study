import { buildAnalyzeMaterialPrompt } from "@/lib/ai/prompts";
import { AiCallError, requestGeminiJson } from "@/lib/ai/gemini-client";
import { extractPdfText } from "@/lib/ai/pdf-extract";
import {
  analyzeMaterialJsonSchema,
  AnalyzeMaterialSchema,
  type AiApiResponse,
  type AnalyzeMaterialAIResult,
} from "@/lib/ai/schemas";

export const runtime = "nodejs";

type AnalyzeMaterialRequest = {
  subjectId?: string;
  subjectName: string;
  weekNumber: number;
  fileName: string;
  mimeType: string;
  fileBase64?: string;
  plainText?: string;
};

const MAX_TEXT_LENGTH = 60_000;
const MAX_BASE64_LENGTH = 10_000_000;
const MAX_EXTRACTED_TEXT_LENGTH = 100_000;
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_TOTAL_FILE_SIZE = 50 * 1024 * 1024;

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isText(file: File) {
  return file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".txt");
}

function isUploadedFile(entry: FormDataEntryValue): entry is File {
  return (
    typeof entry === "object" &&
    entry !== null &&
    "arrayBuffer" in entry &&
    "name" in entry &&
    "size" in entry &&
    typeof entry.arrayBuffer === "function"
  );
}

function normalizeWeekNumber(value: FormDataEntryValue | null) {
  const weekNumber = Number(value);
  return Number.isInteger(weekNumber) ? weekNumber : NaN;
}

function trimText(text: string) {
  return text.length > MAX_EXTRACTED_TEXT_LENGTH ? text.slice(0, MAX_EXTRACTED_TEXT_LENGTH) : text;
}

async function parseMultipartRequest(request: Request): Promise<{
  body: AnalyzeMaterialRequest;
  warnings: string[];
}> {
  const formData = await request.formData();
  const subjectId = String(formData.get("subjectId") ?? "");
  const subjectName = String(formData.get("subjectName") ?? "");
  const weekNumber = normalizeWeekNumber(formData.get("weekNumber"));
  const files = formData.getAll("files").filter(isUploadedFile);
  const warnings: string[] = [];

  if (!subjectName || !Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 16) {
    throw new AiCallError("INVALID_JSON", "과목명과 1~16 사이의 주차가 필요합니다.");
  }

  const plainTextFallback = String(formData.get("plainText") ?? "").trim();
  if (files.length === 0) {
    if (!plainTextFallback) {
      throw new AiCallError("FILE_ERROR", "분석할 PDF 또는 텍스트 파일이 필요합니다.");
    }
    return {
      body: {
        subjectId,
        subjectName,
        weekNumber,
        fileName: "텍스트 자료",
        mimeType: "text/plain",
        plainText: trimText(plainTextFallback),
      },
      warnings,
    };
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_TOTAL_FILE_SIZE) {
    throw new AiCallError("FILE_ERROR", "전체 파일 크기가 너무 큽니다. 50MB 이하로 업로드하세요.");
  }

  const materialTexts: string[] = [];
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new AiCallError("FILE_ERROR", `${file.name} 파일이 너무 큽니다. 25MB 이하 PDF를 사용하세요.`);
    }

    if (isPdf(file)) {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const extracted = await extractPdfText(buffer);
      if (!extracted.text) {
        warnings.push(`${file.name}에서 텍스트를 추출하지 못했습니다. 스캔 PDF일 수 있습니다.`);
        continue;
      }
      materialTexts.push(
        [`[파일: ${file.name}]`, extracted.pageCount ? `[페이지 수: ${extracted.pageCount}]` : "", extracted.text]
          .filter(Boolean)
          .join("\n")
      );
      continue;
    }

    if (isText(file)) {
      materialTexts.push([`[파일: ${file.name}]`, await file.text()].join("\n"));
      continue;
    }

    throw new AiCallError("FILE_ERROR", `${file.name}은 지원하지 않는 파일 형식입니다. PDF 또는 TXT를 사용하세요.`);
  }

  if (materialTexts.length === 0) {
    throw new AiCallError("FILE_ERROR", "파일에서 분석할 텍스트를 추출하지 못했습니다.");
  }

  const mergedText = materialTexts.join("\n\n---\n\n");
  if (mergedText.length > MAX_EXTRACTED_TEXT_LENGTH) {
    warnings.push("자료가 길어 앞부분 중심으로 분석했습니다.");
  }

  return {
    body: {
      subjectId,
      subjectName,
      weekNumber,
      fileName: files.length === 1 ? files[0].name : `${files.length}개 자료 통합`,
      mimeType: files.length === 1 ? files[0].type || "application/octet-stream" : "text/plain",
      plainText: trimText(mergedText),
    },
    warnings,
  };
}

function fallbackAnalysis(body: AnalyzeMaterialRequest, message: string) {
  const base = body.fileName.replace(/\.[^.]+$/, "") || `${body.subjectName} ${body.weekNumber}주차`;
  const data: AnalyzeMaterialAIResult = {
    subjectName: body.subjectName,
    weekNumber: body.weekNumber,
    weekTitle: `${body.subjectName} ${body.weekNumber}주차`,
    concepts: [
      {
        title: base,
        type: "main_concept",
        description: "자료 분석 실패 시 생성된 임시 중심 개념",
        sourceExcerpt: body.plainText?.slice(0, 80) || body.fileName,
        importance: 1,
      },
      {
        title: "핵심 요건",
        type: "requirement",
        description: "자료를 다시 확인해 채워야 할 요건 단서",
        sourceExcerpt: body.fileName,
        parentTitle: base,
        importance: 2,
      },
      {
        title: "효과와 예외",
        type: "effect",
        description: "자료를 다시 확인해 구분해야 할 효과와 예외 단서",
        sourceExcerpt: body.fileName,
        parentTitle: base,
        importance: 2,
      },
    ],
    outline: [{ label: "임시 개념 구조", conceptTitles: [base, "핵심 요건", "효과와 예외"] }],
    keywords: [base.slice(0, 12), "요건", "효과"],
  };
  return Response.json({ ok: true, data, fallback: true, message } satisfies AiApiResponse<AnalyzeMaterialAIResult>);
}

export async function POST(request: Request) {
  let body: AnalyzeMaterialRequest;
  let warnings: string[] = [];
  try {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const parsed = await parseMultipartRequest(request);
      body = parsed.body;
      warnings = parsed.warnings;
    } else {
      body = await request.json();
    }
  } catch (error) {
    if (error instanceof AiCallError) {
      return Response.json(
        { ok: false, errorCode: error.errorCode, message: error.message } satisfies AiApiResponse<never>,
        { status: error.errorCode === "FILE_ERROR" ? 413 : 400 }
      );
    }
    return Response.json(
      { ok: false, errorCode: "INVALID_JSON", message: "요청 JSON을 읽을 수 없습니다." } satisfies AiApiResponse<never>,
      { status: 400 }
    );
  }

  if (!body.subjectName || !body.weekNumber || !body.fileName || !body.mimeType) {
    return Response.json(
      { ok: false, errorCode: "INVALID_JSON", message: "과목명, 주차, 파일명이 필요합니다." } satisfies AiApiResponse<never>,
      { status: 400 }
    );
  }

  if (body.plainText && body.plainText.length > MAX_TEXT_LENGTH) {
    body = { ...body, plainText: body.plainText.slice(0, MAX_TEXT_LENGTH) };
  }
  if (body.fileBase64 && body.fileBase64.length > MAX_BASE64_LENGTH) {
    return Response.json(
      { ok: false, errorCode: "FILE_ERROR", message: "파일이 너무 큽니다. 더 작은 PDF 또는 텍스트를 사용하세요." } satisfies AiApiResponse<never>,
      { status: 413 }
    );
  }

  const prompt = buildAnalyzeMaterialPrompt({
    subjectName: body.subjectName,
    weekNumber: body.weekNumber,
    fileName: body.fileName,
    materialLabel: body.plainText ? body.plainText : "첨부 PDF 문서",
  });

  const geminiInput =
    body.fileBase64 && body.mimeType === "application/pdf"
      ? [
          { text: prompt },
          { inlineData: { data: body.fileBase64, mimeType: "application/pdf" } },
        ]
      : prompt;

  try {
    const data = await requestGeminiJson({
      prompt: geminiInput,
      jsonSchema: analyzeMaterialJsonSchema,
      zodSchema: AnalyzeMaterialSchema,
    });

    return Response.json({ ok: true, data, warnings } satisfies AiApiResponse<AnalyzeMaterialAIResult> & { warnings?: string[] });
  } catch (error) {
    const aiError = error as AiCallError;
    return fallbackAnalysis(body, aiError.message ?? "AI 자료 분석에 실패해 임시 개념 구조를 만들었습니다.");
  }
}
