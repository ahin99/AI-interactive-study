import { z } from "zod";

export const KnowledgeStatusSchema = z.enum([
  "unreviewed",
  "not_recalled",
  "misconception",
  "partial",
  "complete",
]);

export const ConceptTypeSchema = z.enum([
  "main_concept",
  "statute",
  "requirement",
  "effect",
  "exception",
  "case",
  "comparison",
]);

export const VerificationQuestionSchema = z.object({
  type: z.enum(["reason", "boundary", "comparison", "application", "premise"]),
  question: z.string().min(1),
  targetConceptTitles: z.array(z.string()),
  hiddenRubric: z.string().min(1),
});

export const AnalyzeMaterialSchema = z.object({
  subjectName: z.string().min(1),
  weekNumber: z.number().int().min(1).max(16),
  weekTitle: z.string().min(1),
  concepts: z.array(
    z.object({
      title: z.string().min(1),
      type: ConceptTypeSchema,
      description: z.string(),
      sourceExcerpt: z.string(),
      parentTitle: z.string().optional(),
      importance: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    })
  ),
  outline: z.array(
    z.object({
      label: z.string().min(1),
      conceptTitles: z.array(z.string()),
    })
  ),
  keywords: z.tuple([z.string(), z.string(), z.string()]),
});

export const GradeRecallSchema = z.object({
  answerBlocks: z.array(
    z.object({
      text: z.string(),
      highlights: z.array(
        z.object({
          phrase: z.string(),
          status: z.enum(["misconception", "partial", "complete"]),
          hint: z.string(),
        })
      ),
    })
  ),
  missingHints: z.array(z.string()),
  verificationQuestions: z.array(VerificationQuestionSchema).length(3),
  nextReviewHint: z.string(),
  statusByConceptTitle: z.record(z.string(), KnowledgeStatusSchema),
  metacognition: z.object({
    overestimatedConceptTitles: z.array(z.string()),
    shortReason: z.string(),
  }),
});

export const VerifySocraticSchema = z.object({
  results: z.array(
    z.object({
      questionId: z.string(),
      status: z.enum(["correct", "partial", "incorrect"]),
      hint: z.string(),
      relatedConceptTitles: z.array(z.string()),
    })
  ),
  updatedStatusByConceptTitle: z.record(z.string(), KnowledgeStatusSchema),
  finalReviewHint: z.string(),
});

export type AnalyzeMaterialAIResult = z.infer<typeof AnalyzeMaterialSchema>;
export type GradeRecallAIResult = z.infer<typeof GradeRecallSchema>;
export type VerifySocraticAIResult = z.infer<typeof VerifySocraticSchema>;

export type AiApiErrorCode =
  | "RATE_LIMIT"
  | "INVALID_JSON"
  | "SAFETY_BLOCKED"
  | "FILE_ERROR"
  | "MISSING_API_KEY"
  | "UNKNOWN";

export type AiApiResponse<T> =
  | { ok: true; data: T; fallback?: boolean; message?: string }
  | { ok: false; errorCode: AiApiErrorCode; message: string };

export const analyzeMaterialJsonSchema = {
  type: "object",
  properties: {
    subjectName: { type: "string" },
    weekNumber: { type: "integer" },
    weekTitle: { type: "string" },
    concepts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          type: {
            type: "string",
            enum: ["main_concept", "statute", "requirement", "effect", "exception", "case", "comparison"],
          },
          description: { type: "string" },
          sourceExcerpt: { type: "string" },
          parentTitle: { type: "string" },
          importance: { type: "integer", enum: [1, 2, 3] },
        },
        required: ["title", "type", "description", "sourceExcerpt", "importance"],
      },
    },
    outline: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          conceptTitles: { type: "array", items: { type: "string" } },
        },
        required: ["label", "conceptTitles"],
      },
    },
    keywords: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" },
    },
  },
  required: ["subjectName", "weekNumber", "weekTitle", "concepts", "outline", "keywords"],
} as const;

export const gradeRecallJsonSchema = {
  type: "object",
  properties: {
    answerBlocks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          highlights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                phrase: { type: "string" },
                status: { type: "string", enum: ["misconception", "partial", "complete"] },
                hint: { type: "string" },
              },
              required: ["phrase", "status", "hint"],
            },
          },
        },
        required: ["text", "highlights"],
      },
    },
    missingHints: { type: "array", items: { type: "string" } },
    verificationQuestions: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["reason", "boundary", "comparison", "application", "premise"] },
          question: { type: "string" },
          targetConceptTitles: { type: "array", items: { type: "string" } },
          hiddenRubric: { type: "string" },
        },
        required: ["type", "question", "targetConceptTitles", "hiddenRubric"],
      },
    },
    nextReviewHint: { type: "string" },
    statusByConceptTitle: {
      type: "object",
      additionalProperties: {
        type: "string",
        enum: ["unreviewed", "not_recalled", "misconception", "partial", "complete"],
      },
    },
    metacognition: {
      type: "object",
      properties: {
        overestimatedConceptTitles: { type: "array", items: { type: "string" } },
        shortReason: { type: "string" },
      },
      required: ["overestimatedConceptTitles", "shortReason"],
    },
  },
  required: [
    "answerBlocks",
    "missingHints",
    "verificationQuestions",
    "nextReviewHint",
    "statusByConceptTitle",
    "metacognition",
  ],
} as const;

export const verifySocraticJsonSchema = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          questionId: { type: "string" },
          status: { type: "string", enum: ["correct", "partial", "incorrect"] },
          hint: { type: "string" },
          relatedConceptTitles: { type: "array", items: { type: "string" } },
        },
        required: ["questionId", "status", "hint", "relatedConceptTitles"],
      },
    },
    updatedStatusByConceptTitle: {
      type: "object",
      additionalProperties: {
        type: "string",
        enum: ["unreviewed", "not_recalled", "misconception", "partial", "complete"],
      },
    },
    finalReviewHint: { type: "string" },
  },
  required: ["results", "updatedStatusByConceptTitle", "finalReviewHint"],
} as const;
