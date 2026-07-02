import { buildGradeRecallPrompt } from "@/lib/ai/prompts";
import { requestGeminiJson, type AiCallError } from "@/lib/ai/gemini-client";
import {
  gradeRecallJsonSchema,
  GradeRecallSchema,
  type AiApiResponse,
} from "@/lib/ai/schemas";
import { gradeAiResultToWeekFeedback } from "@/lib/ai/transforms";
import {
  generateMockWeekFeedback,
  getSubjectById,
  getWeekById,
  getWeekConcepts,
} from "@/lib/mock-data";
import type { RecallDifficulty, SelfAssessment, WeekConcept, WeekFeedbackResult } from "@/lib/types";

type GradeRecallRequest = {
  subjectId: string;
  weekId: string;
  subjectName?: string;
  weekTitle?: string;
  concepts?: WeekConcept[];
  selfAssessments: SelfAssessment[];
  difficulty: RecallDifficulty;
  answerText: string;
  previousRecords?: { submittedAt: string; nextReviewHint: string }[];
};

function fallbackFeedback(body: GradeRecallRequest, message: string) {
  const recordId = `record-${body.weekId}-${Date.now()}`;
  let data = generateMockWeekFeedback(body.weekId, body.answerText, recordId);
  if (Object.keys(data.statusByConceptId).length === 0 && body.concepts?.length) {
    data = {
      ...data,
      missingHints: body.concepts.slice(0, 2).map((concept) => `${concept.title} 관련 내용을 자료에서 다시 확인하세요.`),
      verificationQuestions: [
        {
          id: "q1",
          type: "reason",
          question: `${body.concepts[0]?.title ?? "핵심 개념"}이 필요한 이유를 설명할 수 있나요?`,
          targetConceptTitles: body.concepts.slice(0, 1).map((concept) => concept.title),
          hiddenRubric: "핵심 개념의 기능과 요건을 연결해 설명하는지 확인한다.",
        },
        {
          id: "q2",
          type: "boundary",
          question: `${body.concepts[1]?.title ?? "관련 개념"}이 적용되지 않는 경계는 어디인가요?`,
          targetConceptTitles: body.concepts.slice(1, 2).map((concept) => concept.title),
          hiddenRubric: "적용 범위와 예외를 구분하는지 확인한다.",
        },
        {
          id: "q3",
          type: "comparison",
          question: `${body.concepts[2]?.title ?? "비교 개념"}과 앞의 개념은 어떤 기준으로 구분되나요?`,
          targetConceptTitles: body.concepts.slice(0, 3).map((concept) => concept.title),
          hiddenRubric: "비슷한 개념의 요건 또는 효과 차이를 말하는지 확인한다.",
        },
      ],
      statusByConceptId: Object.fromEntries(body.concepts.map((concept) => [concept.id, "partial" as const])),
    };
  }
  return Response.json({ ok: true, data, fallback: true, message } satisfies AiApiResponse<WeekFeedbackResult>);
}

export async function POST(request: Request) {
  let body: GradeRecallRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, errorCode: "INVALID_JSON", message: "요청 JSON을 읽을 수 없습니다." } satisfies AiApiResponse<never>,
      { status: 400 }
    );
  }

  if (!body.weekId || !body.answerText?.trim()) {
    return Response.json(
      { ok: false, errorCode: "INVALID_JSON", message: "weekId와 answerText가 필요합니다." } satisfies AiApiResponse<never>,
      { status: 400 }
    );
  }

  const concepts = body.concepts?.length ? body.concepts : getWeekConcepts(body.weekId);
  const week = getWeekById(body.weekId);
  const subject = getSubjectById(body.subjectId);
  const weekTitle = body.weekTitle ?? week?.title;
  const subjectName = body.subjectName ?? subject?.name ?? body.subjectId;
  if (!weekTitle || concepts.length === 0) {
    return fallbackFeedback(body, "주차 정보를 찾지 못해 mock 피드백을 사용했습니다.");
  }

  const recallRecordId = `record-${body.weekId}-${Date.now()}`;

  try {
    const ai = await requestGeminiJson({
      prompt: buildGradeRecallPrompt({
        subjectName,
        weekTitle,
        concepts,
        selfAssessments: body.selfAssessments,
        difficulty: body.difficulty,
        answerText: body.answerText.slice(0, 8000),
        previousRecords: body.previousRecords,
      }),
      jsonSchema: gradeRecallJsonSchema,
      zodSchema: GradeRecallSchema,
    });

    const data = gradeAiResultToWeekFeedback({
      ai,
      concepts,
      weekId: body.weekId,
      recallRecordId,
    });
    return Response.json({ ok: true, data } satisfies AiApiResponse<WeekFeedbackResult>);
  } catch (error) {
    const aiError = error as AiCallError;
    return fallbackFeedback(body, aiError.message ?? "AI 피드백 생성에 실패해 mock 피드백을 사용했습니다.");
  }
}
