import { buildAnalyzeMaterialPrompt } from "@/lib/ai/prompts";
import { requestGeminiJson, type AiCallError } from "@/lib/ai/gemini-client";
import {
  analyzeMaterialJsonSchema,
  AnalyzeMaterialSchema,
  type AiApiResponse,
  type AnalyzeMaterialAIResult,
} from "@/lib/ai/schemas";

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
  try {
    body = await request.json();
  } catch {
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
          { type: "text", text: prompt },
          { type: "document", data: body.fileBase64, mime_type: "application/pdf" },
        ]
      : prompt;

  try {
    const data = await requestGeminiJson({
      prompt: geminiInput,
      jsonSchema: analyzeMaterialJsonSchema,
      zodSchema: AnalyzeMaterialSchema,
    });

    return Response.json({ ok: true, data } satisfies AiApiResponse<AnalyzeMaterialAIResult>);
  } catch (error) {
    const aiError = error as AiCallError;
    return fallbackAnalysis(body, aiError.message ?? "AI 자료 분석에 실패해 임시 개념 구조를 만들었습니다.");
  }
}
