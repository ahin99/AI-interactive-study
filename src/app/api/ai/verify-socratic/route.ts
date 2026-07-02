import { buildVerifySocraticPrompt } from "@/lib/ai/prompts";
import { requestGeminiJson, type AiCallError } from "@/lib/ai/gemini-client";
import {
  verifySocraticJsonSchema,
  VerifySocraticSchema,
  type AiApiResponse,
  type VerifySocraticAIResult,
} from "@/lib/ai/schemas";
import { getSubjectById, getWeekById } from "@/lib/mock-data";
import type { KnowledgeStatus, VerificationQuestion } from "@/lib/types";

type VerifySocraticRequest = {
  subjectId: string;
  weekId: string;
  subjectName?: string;
  weekTitle?: string;
  questionsWithHiddenRubric: VerificationQuestion[];
  verificationAnswers: Record<string, string>;
  statusByConceptTitle: Record<string, KnowledgeStatus>;
};

function fallbackVerification(body: VerifySocraticRequest, message: string) {
  const data: VerifySocraticAIResult = {
    results: body.questionsWithHiddenRubric.map((question) => ({
      questionId: question.id,
      status: "partial",
      hint: "답변 방향은 기록했습니다. 관련 개념의 요건과 예외를 자료에서 다시 대조하세요.",
      relatedConceptTitles: question.targetConceptTitles ?? [],
    })),
    updatedStatusByConceptTitle: body.statusByConceptTitle,
    finalReviewHint: "검증 질문에서 확신이 부족한 개념을 자료와 대조한 뒤 다시 백지복습하세요.",
  };
  return Response.json({ ok: true, data, fallback: true, message } satisfies AiApiResponse<VerifySocraticAIResult>);
}

export async function POST(request: Request) {
  let body: VerifySocraticRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, errorCode: "INVALID_JSON", message: "요청 JSON을 읽을 수 없습니다." } satisfies AiApiResponse<never>,
      { status: 400 }
    );
  }

  if (!body.weekId || body.questionsWithHiddenRubric.length === 0) {
    return Response.json(
      { ok: false, errorCode: "INVALID_JSON", message: "weekId와 질문 목록이 필요합니다." } satisfies AiApiResponse<never>,
      { status: 400 }
    );
  }

  const week = getWeekById(body.weekId);
  const subject = getSubjectById(body.subjectId);
  const weekTitle = body.weekTitle ?? week?.title;
  const subjectName = body.subjectName ?? subject?.name ?? body.subjectId;
  if (!weekTitle) {
    return fallbackVerification(body, "주차 정보를 찾지 못해 검증 결과를 보수적으로 저장했습니다.");
  }

  try {
    const data = await requestGeminiJson({
      prompt: buildVerifySocraticPrompt({
        subjectName,
        weekTitle,
        questionsWithHiddenRubric: body.questionsWithHiddenRubric,
        verificationAnswers: body.verificationAnswers,
        statusByConceptTitle: body.statusByConceptTitle,
      }),
      jsonSchema: verifySocraticJsonSchema,
      zodSchema: VerifySocraticSchema,
    });

    return Response.json({ ok: true, data } satisfies AiApiResponse<VerifySocraticAIResult>);
  } catch (error) {
    const aiError = error as AiCallError;
    return fallbackVerification(body, aiError.message ?? "AI 질문 검증에 실패해 기존 상태를 유지했습니다.");
  }
}
