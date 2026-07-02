export type ConceptType =
  | "unit"
  | "main_concept"
  | "statute"
  | "requirement"
  | "effect"
  | "exception"
  | "case"
  | "comparison";

export type UnderstandingLevel =
  | "complete"
  | "partial"
  | "misconception"
  | "missing";

export type RecallLevel = 1 | 2 | 3;

export interface StudyMaterial {
  id: string;
  title: string;
  course: string;
  week: string;
  fileName: string;
  uploadedAt: string;
  status: "ready" | "analyzing" | "analyzed" | "failed";
}

export interface ConceptNode {
  id: string;
  parentId?: string;
  title: string;
  type: ConceptType;
  description?: string;
  sourceExcerpt?: string;
  children?: ConceptNode[];
}

export interface SelfAssessment {
  conceptId: string;
  predictedKnown: boolean;
}

export interface RecallSession {
  id: string;
  materialId: string;
  conceptId: string;
  level: RecallLevel;
  answerText: string;
  submittedAt?: string;
}

export interface FeedbackResult {
  recallSessionId: string;
  missingPoints: string[];
  misconceptions: string[];
  verificationQuestions: string[];
  nextReviewHints: string[];
  understandingLevelByConcept: Record<string, UnderstandingLevel>;
}

export interface KnowledgeMetric {
  completionRate: number;
  metacognitionGapRate: number;
  overestimatedConceptIds: string[];
}

// ---- 주차 중심 모델 (최종 수정사항) ----

export type KnowledgeStatus =
  | "unreviewed"
  | "not_recalled"
  | "misconception"
  | "partial"
  | "complete";

export type MapMode = "knowledge" | "metacognition";

export type RecallDifficulty = "outline" | "keywords" | "blank";

export interface Subject {
  id: string;
  name: string;
  completionRate: number;
  metacognitionGapRate: number;
  lastReviewedAt: string;
  lastReviewHint: string;
  materialCount: number;
  recent: boolean;
}

export interface StudyWeek {
  id: string;
  subjectId: string;
  weekNumber: number;
  title: string;
  materialIds: string[];
  reviewCount: number;
}

export interface WeekMaterial {
  id: string;
  subjectId: string;
  weekId: string;
  displayName: string;
  fileName: string;
  uploadedAt: string;
  status: "ready" | "analyzing" | "analyzed" | "failed";
}

export interface WeekConcept {
  id: string;
  weekId: string;
  title: string;
  type: ConceptType;
  description?: string;
  sourceExcerpt?: string;
  outlineLabel?: string;
  keyword?: string;
}

export interface ConceptMapTile {
  conceptId: string;
  status: KnowledgeStatus;
  metacognitionGap: number | null;
}

export interface MapSnapshot {
  id: string;
  subjectId: string;
  weekId?: string;
  label: string;
  reviewNumber: number;
  createdAt: string;
  tilesByConceptId: Record<string, ConceptMapTile>;
}

export interface RecallRecord {
  id: string;
  subjectId: string;
  weekId: string;
  difficulty: RecallDifficulty;
  selfAssessments: SelfAssessment[];
  answerText: string;
  verificationAnswers: Record<string, string>;
  feedbackId: string;
  submittedAt: string;
}

export interface AnnotatedAnswerBlock {
  id: string;
  text: string;
  highlights: {
    phrase: string;
    status: "misconception" | "partial" | "complete";
    hint?: string;
  }[];
}

export interface VerificationQuestion {
  id: string;
  type: "reason" | "boundary" | "comparison" | "application" | "premise";
  question: string;
  hiddenRubric?: string;
  targetConceptTitles?: string[];
}

export interface WeekFeedbackResult {
  id: string;
  recallRecordId: string;
  weekId: string;
  answerBlocks: AnnotatedAnswerBlock[];
  missingHints: string[];
  verificationQuestions: VerificationQuestion[];
  nextReviewHint: string;
  statusByConceptId: Record<string, KnowledgeStatus>;
}
