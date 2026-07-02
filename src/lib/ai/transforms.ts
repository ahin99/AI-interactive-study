import type {
  ConceptMapTile,
  KnowledgeStatus,
  MapSnapshot,
  StudyWeek,
  WeekConcept,
  WeekFeedbackResult,
  WeekMaterial,
} from "@/lib/types";
import type { AnalyzeMaterialAIResult, GradeRecallAIResult, VerifySocraticAIResult } from "./schemas";

function slugify(value: string) {
  const ascii = value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .slice(0, 44);
  return ascii || Math.random().toString(36).slice(2, 10);
}

export function mapStatusByTitleToId(
  concepts: WeekConcept[],
  statusByConceptTitle: Record<string, KnowledgeStatus>
) {
  const result: Record<string, KnowledgeStatus> = {};
  for (const concept of concepts) {
    const status = statusByConceptTitle[concept.title];
    if (status) result[concept.id] = status;
  }
  return result;
}

export function gradeAiResultToWeekFeedback(input: {
  ai: GradeRecallAIResult;
  concepts: WeekConcept[];
  weekId: string;
  recallRecordId: string;
}): WeekFeedbackResult {
  return {
    id: `feedback-${input.recallRecordId}`,
    recallRecordId: input.recallRecordId,
    weekId: input.weekId,
    answerBlocks: input.ai.answerBlocks.map((block, index) => ({
      id: `block-${index + 1}`,
      text: block.text,
      highlights: block.highlights,
    })),
    missingHints: input.ai.missingHints,
    verificationQuestions: input.ai.verificationQuestions.map((question, index) => ({
      id: `q${index + 1}`,
      type: question.type,
      question: question.question,
      hiddenRubric: question.hiddenRubric,
      targetConceptTitles: question.targetConceptTitles,
    })),
    nextReviewHint: input.ai.nextReviewHint,
    statusByConceptId: mapStatusByTitleToId(input.concepts, input.ai.statusByConceptTitle),
  };
}

export function applyVerifyAiResult(input: {
  feedback: WeekFeedbackResult;
  concepts: WeekConcept[];
  ai: VerifySocraticAIResult;
}) {
  return {
    ...input.feedback,
    nextReviewHint: input.ai.finalReviewHint,
    statusByConceptId: {
      ...input.feedback.statusByConceptId,
      ...mapStatusByTitleToId(input.concepts, input.ai.updatedStatusByConceptTitle),
    },
  };
}

export function analyzeAiResultToDemoData(input: {
  ai: AnalyzeMaterialAIResult;
  subjectId: string;
  fileName: string;
  mimeType: string;
}) {
  const weekId = `${input.subjectId}-week-${input.ai.weekNumber}`;
  const materialId = `mat-${weekId}-${slugify(input.fileName)}`;
  const conceptIdByTitle = new Map<string, string>();

  const concepts: WeekConcept[] = input.ai.concepts.map((concept, index) => {
    const id = `${weekId}-${slugify(concept.title)}-${index + 1}`;
    conceptIdByTitle.set(concept.title, id);
    const outline = input.ai.outline.find((item) => item.conceptTitles.includes(concept.title));
    return {
      id,
      weekId,
      title: concept.title,
      type: concept.type,
      description: concept.description,
      sourceExcerpt: concept.sourceExcerpt,
      outlineLabel: outline?.label ?? concept.parentTitle,
      keyword: input.ai.keywords.find((keyword) => concept.title.includes(keyword) || keyword.includes(concept.title)),
    };
  });

  const tilesByConceptId: Record<string, ConceptMapTile> = Object.fromEntries(
    concepts.map((concept) => [
      concept.id,
      { conceptId: concept.id, status: "unreviewed" as const, metacognitionGap: null },
    ])
  );

  const week: StudyWeek = {
    id: weekId,
    subjectId: input.subjectId,
    weekNumber: input.ai.weekNumber,
    title: input.ai.weekTitle,
    materialIds: [materialId],
    reviewCount: 0,
  };

  const material: WeekMaterial = {
    id: materialId,
    subjectId: input.subjectId,
    weekId,
    displayName: input.ai.weekTitle,
    fileName: input.fileName,
    uploadedAt: new Date().toISOString().slice(0, 10),
    status: "analyzed",
  };

  const snapshot: MapSnapshot = {
    id: `snapshot-${weekId}-${Date.now()}`,
    subjectId: input.subjectId,
    weekId,
    label: `${input.ai.weekNumber}주차 분석`,
    reviewNumber: 0,
    createdAt: new Date().toISOString().slice(0, 10),
    tilesByConceptId,
  };

  return { week, material, concepts, snapshot, keywords: input.ai.keywords };
}
