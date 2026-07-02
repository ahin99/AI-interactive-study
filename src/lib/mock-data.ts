import type {
  AnnotatedAnswerBlock,
  ConceptNode,
  FeedbackResult,
  KnowledgeStatus,
  MapSnapshot,
  RecallRecord,
  SelfAssessment,
  StudyMaterial,
  StudyWeek,
  Subject,
  UnderstandingLevel,
  VerificationQuestion,
  WeekConcept,
  WeekFeedbackResult,
  WeekMaterial,
} from "./types";

export const mockMaterials: StudyMaterial[] = [
  {
    id: "civil-law-week4",
    title: "민법총칙 4주차",
    course: "민법총칙",
    week: "4주차",
    fileName: "민법총칙 4주차261, 나반.pdf",
    uploadedAt: "2026-06-30",
    status: "analyzed",
  },
  {
    id: "civil-law-week5",
    title: "민법총칙 5주차",
    course: "민법총칙",
    week: "5주차",
    fileName: "민법총칙 5주차261, 나반.pdf",
    uploadedAt: "2026-06-30",
    status: "analyzed",
  },
];

export const mockConceptTree: ConceptNode = {
  id: "civil-law-general",
  title: "민법총칙",
  type: "unit",
  children: [
    {
      id: "declaration-of-intent",
      title: "의사표시",
      type: "main_concept",
      description: "효과의사를 외부에 표시하는 행위",
      children: [
        {
          id: "false-representation",
          title: "통정허위표시",
          type: "main_concept",
          description: "상대방과 통정하여 진의와 다른 의사표시를 하는 경우",
          children: [
            { id: "article-108", title: "민법 제108조", type: "statute" },
            { id: "collusion", title: "상대방과의 통정", type: "requirement" },
            { id: "intent-mismatch", title: "진의와 표시의 불일치", type: "requirement" },
            { id: "nullity-between-parties", title: "당사자 사이의 무효", type: "effect" },
            { id: "good-faith-third-party", title: "선의의 제3자 보호", type: "exception" },
            { id: "third-party-scope", title: "제3자의 범위", type: "case" },
          ],
        },
        {
          id: "untrue-intention",
          title: "비진의표시",
          type: "comparison",
          description: "표의자 혼자 진의와 다른 의사표시를 하는 경우",
          children: [
            { id: "article-107", title: "민법 제107조", type: "statute" },
            { id: "untrue-intention-effect", title: "상대방이 안 경우 무효", type: "effect" },
          ],
        },
        {
          id: "mistake",
          title: "착오",
          type: "comparison",
          description: "표시와 진의가 일치하지 않음을 표의자가 모르는 경우",
          children: [
            { id: "article-109", title: "민법 제109조", type: "statute" },
            { id: "mistake-effect", title: "취소 가능", type: "effect" },
          ],
        },
      ],
    },
    {
      id: "nullity-and-rescission",
      title: "무효와 취소",
      type: "main_concept",
      description: "법률행위의 효력을 부정하는 두 가지 방식",
      children: [
        { id: "nullity-meaning", title: "무효의 의의", type: "requirement" },
        { id: "rescission-meaning", title: "취소의 의의", type: "requirement" },
      ],
    },
  ],
};

// 자기평가 초기값: 통정허위표시, 비진의표시, 무효와 취소를 안다고 체크된 상태로 시작
export const defaultSelfAssessments: SelfAssessment[] = [
  { conceptId: "false-representation", predictedKnown: true },
  { conceptId: "untrue-intention", predictedKnown: true },
  { conceptId: "nullity-and-rescission", predictedKnown: true },
];

// 첫 백지복습 이전의 초기 이해도(전부 미검증 상태)
export const initialUnderstandingLevels: Record<string, UnderstandingLevel> = {
  "declaration-of-intent": "missing",
  "false-representation": "missing",
  "article-108": "missing",
  collusion: "missing",
  "intent-mismatch": "missing",
  "nullity-between-parties": "missing",
  "good-faith-third-party": "missing",
  "third-party-scope": "missing",
  "untrue-intention": "missing",
  "article-107": "missing",
  "untrue-intention-effect": "missing",
  mistake: "missing",
  "article-109": "missing",
  "mistake-effect": "missing",
  "nullity-and-rescission": "complete",
  "nullity-meaning": "complete",
  "rescission-meaning": "partial",
};

export const mockSampleAnswer =
  "통정허위표시는 진의와 다른 의사표시를 하는 경우이고 무효가 된다. 제3자에게도 무효라고 볼 수 있다. 비진의표시와 비슷하지만 상대방이 알았는지가 중요하다.";

export const mockFeedbackForFalseRepresentation: Omit<FeedbackResult, "recallSessionId"> = {
  missingPoints: [
    "성립요건 중 '상대방과의 통정'이 명확히 드러나지 않음",
    "선의의 제3자 보호 예외가 누락됨",
  ],
  misconceptions: [
    "당사자 사이의 무효와 제3자에 대한 대항 가능성을 혼동하고 있음",
    "비진의표시와 통정허위표시의 구별 기준이 불명확함",
  ],
  verificationQuestions: [
    "통정허위표시가 성립하려면 표의자 혼자 진의와 다른 표시를 하면 충분할까요?",
    "당사자 사이에서 무효인 법률행위가 선의의 제3자에게도 언제나 무효라고 볼 수 있을까요?",
    "비진의표시와 통정허위표시는 상대방의 인식 또는 합의 측면에서 어떻게 다를까요?",
  ],
  nextReviewHints: ["민법 제108조 1항과 2항을 나누어 다시 백지복습하세요."],
  understandingLevelByConcept: {
    "false-representation": "partial",
    "article-108": "partial",
    collusion: "missing",
    "intent-mismatch": "partial",
    "nullity-between-parties": "misconception",
    "good-faith-third-party": "missing",
    "third-party-scope": "misconception",
    "untrue-intention": "misconception",
  },
};

export function findConceptById(id: string, node: ConceptNode = mockConceptTree): ConceptNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const found = findConceptById(id, child);
    if (found) return found;
  }
  return undefined;
}

export function flattenConcepts(node: ConceptNode = mockConceptTree): ConceptNode[] {
  const result: ConceptNode[] = [];
  const walk = (n: ConceptNode) => {
    if (n.type !== "unit") result.push(n);
    (n.children ?? []).forEach(walk);
  };
  walk(node);
  return result;
}

// mock 피드백 생성기: 통정허위표시는 큐레이션된 데이터를, 그 외 개념은 최소 단서형 템플릿을 반환한다.
export function generateMockFeedback(concept: ConceptNode, recallSessionId: string): FeedbackResult {
  if (concept.id === "false-representation") {
    return { recallSessionId, ...mockFeedbackForFalseRepresentation };
  }

  const children = concept.children ?? [];
  const missingChild = children[0]?.title ?? `${concept.title}의 세부 요건`;
  const secondChild = children[1]?.title ?? `${concept.title}의 효과`;

  return {
    recallSessionId,
    missingPoints: [`${missingChild} 관련 내용이 답안에 드러나지 않음`],
    misconceptions: [`${concept.title}과 비교 개념의 구별 기준이 답안에서 불명확함`],
    verificationQuestions: [
      `${concept.title}이 성립하려면 어떤 요건이 필요할까요?`,
      `${secondChild}은 다른 비교 개념과 어떻게 다를까요?`,
    ],
    nextReviewHints: [`${concept.title} 관련 자료를 다시 찾아 백지복습하세요.`],
    understandingLevelByConcept: {
      [concept.id]: "partial",
    },
  };
}

// ============================================================
// 주차 중심 mock 데이터 (최종 수정사항)
// ============================================================

export const mockSubjects: Subject[] = [
  {
    id: "civil-law-general",
    name: "민법총칙",
    completionRate: 62,
    metacognitionGapRate: 92,
    lastReviewedAt: "7일 전",
    lastReviewHint: "의사표시 관련 자료를 다시 찾아 백지복습 하세요.",
    materialCount: 3,
    recent: true,
  },
  {
    id: "constitutional-law",
    name: "헌법",
    completionRate: 38,
    metacognitionGapRate: 57,
    lastReviewedAt: "2일 전",
    lastReviewHint: "기본권 제한의 단계 구조를 다시 백지복습 하세요.",
    materialCount: 4,
    recent: true,
  },
  {
    id: "criminal-law-general",
    name: "형법총론",
    completionRate: 44,
    metacognitionGapRate: 68,
    lastReviewedAt: "3일 전",
    lastReviewHint: "구성요건 해당성과 위법성 조각사유를 분리해 설명하세요.",
    materialCount: 3,
    recent: false,
  },
  {
    id: "obligation-special",
    name: "채권법각론",
    completionRate: 29,
    metacognitionGapRate: 61,
    lastReviewedAt: "5일 전",
    lastReviewHint: "매매의 담보책임과 채무불이행 책임을 비교하세요.",
    materialCount: 3,
    recent: false,
  },
  {
    id: "property-law",
    name: "물권법",
    completionRate: 35,
    metacognitionGapRate: 49,
    lastReviewedAt: "6일 전",
    lastReviewHint: "물권변동의 공시 원칙을 사례로 다시 설명하세요.",
    materialCount: 3,
    recent: false,
  },
  {
    id: "corporate-law",
    name: "회사법",
    completionRate: 41,
    metacognitionGapRate: 54,
    lastReviewedAt: "1일 전",
    lastReviewHint: "주주총회 결의 하자의 유형을 구별하세요.",
    materialCount: 4,
    recent: true,
  },
];

export const mockWeeks: StudyWeek[] = [
  {
    id: "week-4",
    subjectId: "civil-law-general",
    weekNumber: 4,
    title: "4주차 · 의사표시와 착오",
    materialIds: ["mat-week4-1", "mat-week4-2"],
    reviewCount: 2,
  },
  {
    id: "week-5",
    subjectId: "civil-law-general",
    weekNumber: 5,
    title: "5주차 · 무효와 취소",
    materialIds: ["mat-week5-1"],
    reviewCount: 0,
  },
  {
    id: "const-week-1",
    subjectId: "constitutional-law",
    weekNumber: 1,
    title: "1주차 · 헌법의 기본원리",
    materialIds: ["mat-const-1"],
    reviewCount: 1,
  },
  {
    id: "const-week-2",
    subjectId: "constitutional-law",
    weekNumber: 2,
    title: "2주차 · 기본권 제한",
    materialIds: ["mat-const-2"],
    reviewCount: 1,
  },
  {
    id: "const-week-3",
    subjectId: "constitutional-law",
    weekNumber: 3,
    title: "3주차 · 평등권",
    materialIds: ["mat-const-3"],
    reviewCount: 0,
  },
  {
    id: "criminal-week-1",
    subjectId: "criminal-law-general",
    weekNumber: 1,
    title: "1주차 · 범죄체계론",
    materialIds: ["mat-criminal-1"],
    reviewCount: 1,
  },
  {
    id: "criminal-week-2",
    subjectId: "criminal-law-general",
    weekNumber: 2,
    title: "2주차 · 위법성 조각사유",
    materialIds: ["mat-criminal-2"],
    reviewCount: 0,
  },
  {
    id: "obligation-week-1",
    subjectId: "obligation-special",
    weekNumber: 1,
    title: "1주차 · 매매",
    materialIds: ["mat-obligation-1"],
    reviewCount: 1,
  },
  {
    id: "obligation-week-2",
    subjectId: "obligation-special",
    weekNumber: 2,
    title: "2주차 · 임대차",
    materialIds: ["mat-obligation-2"],
    reviewCount: 0,
  },
  {
    id: "property-week-1",
    subjectId: "property-law",
    weekNumber: 1,
    title: "1주차 · 물권변동",
    materialIds: ["mat-property-1"],
    reviewCount: 1,
  },
  {
    id: "property-week-2",
    subjectId: "property-law",
    weekNumber: 2,
    title: "2주차 · 점유권",
    materialIds: ["mat-property-2"],
    reviewCount: 0,
  },
  {
    id: "corporate-week-1",
    subjectId: "corporate-law",
    weekNumber: 1,
    title: "1주차 · 회사의 종류",
    materialIds: ["mat-corporate-1"],
    reviewCount: 1,
  },
  {
    id: "corporate-week-2",
    subjectId: "corporate-law",
    weekNumber: 2,
    title: "2주차 · 주주총회",
    materialIds: ["mat-corporate-2"],
    reviewCount: 1,
  },
  {
    id: "corporate-week-3",
    subjectId: "corporate-law",
    weekNumber: 3,
    title: "3주차 · 이사회",
    materialIds: ["mat-corporate-3"],
    reviewCount: 0,
  },
];

export const mockWeekMaterials: WeekMaterial[] = [
  {
    id: "mat-week4-1",
    subjectId: "civil-law-general",
    weekId: "week-4",
    displayName: "민법총칙 4주차 강의자료",
    fileName: "민법총칙 4주차261, 나반_260630_192818.pdf",
    uploadedAt: "2026-06-20",
    status: "analyzed",
  },
  {
    id: "mat-week4-2",
    subjectId: "civil-law-general",
    weekId: "week-4",
    displayName: "의사표시 판례 정리",
    fileName: "의사표시_판례정리.pdf",
    uploadedAt: "2026-06-21",
    status: "analyzed",
  },
  {
    id: "mat-week5-1",
    subjectId: "civil-law-general",
    weekId: "week-5",
    displayName: "민법총칙 5주차 강의자료",
    fileName: "민법총칙 5주차261, 나반_260630_192809.pdf",
    uploadedAt: "2026-06-30",
    status: "analyzed",
  },
  { id: "mat-const-1", subjectId: "constitutional-law", weekId: "const-week-1", displayName: "헌법 1주차 강의자료", fileName: "헌법_1주차.pdf", uploadedAt: "2026-06-18", status: "analyzed" },
  { id: "mat-const-2", subjectId: "constitutional-law", weekId: "const-week-2", displayName: "기본권 제한 판례", fileName: "기본권제한_판례.pdf", uploadedAt: "2026-06-19", status: "analyzed" },
  { id: "mat-const-3", subjectId: "constitutional-law", weekId: "const-week-3", displayName: "평등권 사례 정리", fileName: "평등권_사례.pdf", uploadedAt: "2026-06-22", status: "analyzed" },
  { id: "mat-criminal-1", subjectId: "criminal-law-general", weekId: "criminal-week-1", displayName: "형법총론 범죄체계론", fileName: "형법총론_1주차.pdf", uploadedAt: "2026-06-17", status: "analyzed" },
  { id: "mat-criminal-2", subjectId: "criminal-law-general", weekId: "criminal-week-2", displayName: "위법성 조각사유", fileName: "위법성조각사유.pdf", uploadedAt: "2026-06-24", status: "analyzed" },
  { id: "mat-obligation-1", subjectId: "obligation-special", weekId: "obligation-week-1", displayName: "채권각론 매매", fileName: "채권각론_매매.pdf", uploadedAt: "2026-06-16", status: "analyzed" },
  { id: "mat-obligation-2", subjectId: "obligation-special", weekId: "obligation-week-2", displayName: "임대차 쟁점", fileName: "임대차_쟁점.pdf", uploadedAt: "2026-06-23", status: "analyzed" },
  { id: "mat-property-1", subjectId: "property-law", weekId: "property-week-1", displayName: "물권변동 총설", fileName: "물권변동.pdf", uploadedAt: "2026-06-15", status: "analyzed" },
  { id: "mat-property-2", subjectId: "property-law", weekId: "property-week-2", displayName: "점유권 사례", fileName: "점유권_사례.pdf", uploadedAt: "2026-06-23", status: "analyzed" },
  { id: "mat-corporate-1", subjectId: "corporate-law", weekId: "corporate-week-1", displayName: "회사법 총론", fileName: "회사법_1주차.pdf", uploadedAt: "2026-06-14", status: "analyzed" },
  { id: "mat-corporate-2", subjectId: "corporate-law", weekId: "corporate-week-2", displayName: "주주총회 결의", fileName: "주주총회.pdf", uploadedAt: "2026-06-21", status: "analyzed" },
  { id: "mat-corporate-3", subjectId: "corporate-law", weekId: "corporate-week-3", displayName: "이사회 운영", fileName: "이사회.pdf", uploadedAt: "2026-06-28", status: "analyzed" },
];

export const mockWeekConcepts: WeekConcept[] = [
  { id: "declaration-of-intent", weekId: "week-4", title: "의사표시", type: "main_concept", description: "효과의사를 외부에 표시하는 행위" },
  { id: "false-representation", weekId: "week-4", title: "통정허위표시", type: "main_concept", description: "상대방과 통정하여 진의와 다른 의사표시를 하는 경우" },
  { id: "article-108", weekId: "week-4", title: "민법 제108조", type: "statute" },
  { id: "collusion", weekId: "week-4", title: "상대방과의 통정", type: "requirement" },
  { id: "intent-mismatch", weekId: "week-4", title: "진의와 표시의 불일치", type: "requirement" },
  { id: "nullity-between-parties", weekId: "week-4", title: "당사자 사이 효력", type: "effect" },
  { id: "good-faith-third-party", weekId: "week-4", title: "선의의 제3자 보호", type: "exception" },
  { id: "untrue-intention", weekId: "week-4", title: "비진의표시", type: "comparison", description: "표의자 혼자 진의와 다른 의사표시를 하는 경우" },
  { id: "mistake", weekId: "week-4", title: "착오", type: "comparison", description: "표시와 진의가 일치하지 않음을 표의자가 모르는 경우" },

  { id: "nullity", weekId: "week-5", title: "무효", type: "main_concept", description: "처음부터 법률효과가 발생하지 않는 상태" },
  { id: "rescission", weekId: "week-5", title: "취소", type: "main_concept", description: "일단 유효하지만 취소권 행사로 소급 무효가 되는 상태" },
  { id: "ratification", weekId: "week-5", title: "추인", type: "requirement" },
  { id: "legal-act-effect", weekId: "week-5", title: "법률행위 효력", type: "effect" },
  { id: "limitation-period", weekId: "week-5", title: "제척기간", type: "exception" },
  ...makeWeekConcepts("const-week-1", ["헌법의 최고규범성", "국민주권", "법치국가원리", "사회국가원리", "권력분립"]),
  ...makeWeekConcepts("const-week-2", ["기본권 주체", "기본권 제한", "과잉금지원칙", "본질내용 침해금지", "이중기준론"]),
  ...makeWeekConcepts("const-week-3", ["평등권", "자의금지원칙", "비례심사", "적극적 평등실현조치", "차별취급"]),
  ...makeWeekConcepts("criminal-week-1", ["구성요건", "위법성", "책임", "고의", "과실"]),
  ...makeWeekConcepts("criminal-week-2", ["정당방위", "긴급피난", "자구행위", "피해자 승낙", "정당행위"]),
  ...makeWeekConcepts("obligation-week-1", ["매매계약", "담보책임", "위험부담", "동시이행항변", "해제"]),
  ...makeWeekConcepts("obligation-week-2", ["임대차", "차임지급", "수선의무", "보증금", "대항력"]),
  ...makeWeekConcepts("property-week-1", ["물권변동", "등기", "인도", "공신의 원칙", "중간생략등기"]),
  ...makeWeekConcepts("property-week-2", ["점유", "자주점유", "점유보호청구권", "취득시효", "간접점유"]),
  ...makeWeekConcepts("corporate-week-1", ["합명회사", "합자회사", "유한책임회사", "주식회사", "법인격"]),
  ...makeWeekConcepts("corporate-week-2", ["주주총회", "소집절차", "결의요건", "결의취소", "결의무효"]),
  ...makeWeekConcepts("corporate-week-3", ["이사회", "대표이사", "감사의 권한", "업무집행", "충실의무"]),
];

function makeWeekConcepts(weekId: string, titles: string[]): WeekConcept[] {
  const types: WeekConcept["type"][] = ["main_concept", "requirement", "effect", "case", "comparison"];
  return titles.map((title, index) => ({
    id: `${weekId}-concept-${index + 1}`,
    weekId,
    title,
    type: types[index % types.length],
    description: `${title}의 성립요건과 효과를 구별해 설명하는 시연용 개념`,
  }));
}

export function getWeekConcepts(weekId: string): WeekConcept[] {
  return mockWeekConcepts.filter((c) => c.weekId === weekId);
}

export function findWeekConcept(conceptId: string): WeekConcept | undefined {
  return mockWeekConcepts.find((c) => c.id === conceptId);
}

export function getWeekMaterials(weekId: string): WeekMaterial[] {
  return mockWeekMaterials.filter((m) => m.weekId === weekId);
}

export function getSubjectById(subjectId: string): Subject | undefined {
  return mockSubjects.find((s) => s.id === subjectId);
}

export function getWeeksBySubject(subjectId: string): StudyWeek[] {
  return mockWeeks.filter((w) => w.subjectId === subjectId);
}

export function getWeekById(weekId: string): StudyWeek | undefined {
  return mockWeeks.find((w) => w.id === weekId);
}

// 난이도 "핵심 키워드 3개"에서 보여줄 주차별 고정 키워드
export const mockWeekKeywords: Record<string, [string, string, string]> = {
  "week-4": ["통정허위표시", "비진의표시", "착오"],
  "week-5": ["무효", "취소", "추인"],
  "const-week-1": ["국민주권", "법치국가", "권력분립"],
  "const-week-2": ["기본권 제한", "과잉금지", "본질내용"],
  "criminal-week-1": ["구성요건", "위법성", "책임"],
  "obligation-week-1": ["담보책임", "위험부담", "해제"],
  "property-week-1": ["등기", "인도", "공시"],
  "corporate-week-2": ["소집절차", "결의요건", "결의하자"],
};

// 주차 자기평가 초기값
export const defaultWeekSelfAssessments: Record<string, SelfAssessment[]> = {
  "week-4": [
    { conceptId: "false-representation", predictedKnown: true },
    { conceptId: "untrue-intention", predictedKnown: true },
    { conceptId: "declaration-of-intent", predictedKnown: true },
  ],
  "week-5": [],
  "const-week-1": [{ conceptId: "const-week-1-concept-2", predictedKnown: true }],
  "const-week-2": [{ conceptId: "const-week-2-concept-3", predictedKnown: true }],
  "criminal-week-1": [{ conceptId: "criminal-week-1-concept-1", predictedKnown: true }],
  "obligation-week-1": [{ conceptId: "obligation-week-1-concept-2", predictedKnown: true }],
  "property-week-1": [{ conceptId: "property-week-1-concept-1", predictedKnown: true }],
  "corporate-week-2": [{ conceptId: "corporate-week-2-concept-4", predictedKnown: true }],
};

function tile(status: KnowledgeStatus, metacognitionGap: number | null) {
  return { status, metacognitionGap };
}

const week5UnreviewedTiles: MapSnapshot["tilesByConceptId"] = {
  nullity: { conceptId: "nullity", ...tile("unreviewed", null) },
  rescission: { conceptId: "rescission", ...tile("unreviewed", null) },
  ratification: { conceptId: "ratification", ...tile("unreviewed", null) },
  "legal-act-effect": { conceptId: "legal-act-effect", ...tile("unreviewed", null) },
  "limitation-period": { conceptId: "limitation-period", ...tile("unreviewed", null) },
};

const demoStatusCycle: KnowledgeStatus[] = [
  "complete",
  "partial",
  "misconception",
  "not_recalled",
  "partial",
  "unreviewed",
];

function buildSubjectTiles(subjectId: string, offset = 0): MapSnapshot["tilesByConceptId"] {
  const weekIds = mockWeeks.filter((week) => week.subjectId === subjectId).map((week) => week.id);
  const conceptIds = mockWeekConcepts
    .filter((concept) => weekIds.includes(concept.weekId))
    .map((concept) => concept.id);

  return Object.fromEntries(
    conceptIds.map((conceptId, index) => {
      const status = demoStatusCycle[(index + offset) % demoStatusCycle.length];
      const gap = status === "unreviewed" ? null : 25 + ((index + offset) * 13) % 68;
      return [conceptId, { conceptId, ...tile(status, gap) }];
    })
  );
}

export const mockKnowledgeSnapshots: MapSnapshot[] = [
  {
    id: "snapshot-1",
    subjectId: "civil-law-general",
    label: "1회차",
    reviewNumber: 1,
    createdAt: "2026-06-22",
    tilesByConceptId: {
      "declaration-of-intent": { conceptId: "declaration-of-intent", ...tile("partial", 40) },
      "false-representation": { conceptId: "false-representation", ...tile("partial", 65) },
      "article-108": { conceptId: "article-108", ...tile("partial", 55) },
      collusion: { conceptId: "collusion", ...tile("not_recalled", 80) },
      "intent-mismatch": { conceptId: "intent-mismatch", ...tile("partial", 50) },
      "nullity-between-parties": { conceptId: "nullity-between-parties", ...tile("misconception", 90) },
      "good-faith-third-party": { conceptId: "good-faith-third-party", ...tile("not_recalled", 75) },
      "untrue-intention": { conceptId: "untrue-intention", ...tile("misconception", 85) },
      mistake: { conceptId: "mistake", ...tile("unreviewed", null) },
      ...week5UnreviewedTiles,
    },
  },
  {
    id: "snapshot-2",
    subjectId: "civil-law-general",
    label: "2회차",
    reviewNumber: 2,
    createdAt: "2026-06-25",
    tilesByConceptId: {
      "declaration-of-intent": { conceptId: "declaration-of-intent", ...tile("complete", 20) },
      "false-representation": { conceptId: "false-representation", ...tile("partial", 65) },
      "article-108": { conceptId: "article-108", ...tile("partial", 55) },
      collusion: { conceptId: "collusion", ...tile("partial", 60) },
      "intent-mismatch": { conceptId: "intent-mismatch", ...tile("complete", 25) },
      "nullity-between-parties": { conceptId: "nullity-between-parties", ...tile("misconception", 90) },
      "good-faith-third-party": { conceptId: "good-faith-third-party", ...tile("not_recalled", 85) },
      "untrue-intention": { conceptId: "untrue-intention", ...tile("misconception", 78) },
      mistake: { conceptId: "mistake", ...tile("partial", 45) },
      ...week5UnreviewedTiles,
    },
  },
  {
    id: "snapshot-current",
    subjectId: "civil-law-general",
    label: "현재",
    reviewNumber: 2,
    createdAt: "2026-06-25",
    tilesByConceptId: {
      "declaration-of-intent": { conceptId: "declaration-of-intent", ...tile("complete", 20) },
      "false-representation": { conceptId: "false-representation", ...tile("partial", 65) },
      "article-108": { conceptId: "article-108", ...tile("partial", 55) },
      collusion: { conceptId: "collusion", ...tile("partial", 60) },
      "intent-mismatch": { conceptId: "intent-mismatch", ...tile("complete", 25) },
      "nullity-between-parties": { conceptId: "nullity-between-parties", ...tile("misconception", 90) },
      "good-faith-third-party": { conceptId: "good-faith-third-party", ...tile("not_recalled", 85) },
      "untrue-intention": { conceptId: "untrue-intention", ...tile("misconception", 78) },
      mistake: { conceptId: "mistake", ...tile("partial", 45) },
      ...week5UnreviewedTiles,
    },
  },
  {
    id: "snapshot-constitutional-law-current",
    subjectId: "constitutional-law",
    label: "현재",
    reviewNumber: 2,
    createdAt: "2026-06-29",
    tilesByConceptId: buildSubjectTiles("constitutional-law", 1),
  },
  {
    id: "snapshot-criminal-law-general-current",
    subjectId: "criminal-law-general",
    label: "현재",
    reviewNumber: 1,
    createdAt: "2026-06-27",
    tilesByConceptId: buildSubjectTiles("criminal-law-general", 2),
  },
  {
    id: "snapshot-obligation-special-current",
    subjectId: "obligation-special",
    label: "현재",
    reviewNumber: 1,
    createdAt: "2026-06-26",
    tilesByConceptId: buildSubjectTiles("obligation-special", 3),
  },
  {
    id: "snapshot-property-law-current",
    subjectId: "property-law",
    label: "현재",
    reviewNumber: 1,
    createdAt: "2026-06-26",
    tilesByConceptId: buildSubjectTiles("property-law", 4),
  },
  {
    id: "snapshot-corporate-law-current",
    subjectId: "corporate-law",
    label: "현재",
    reviewNumber: 2,
    createdAt: "2026-06-30",
    tilesByConceptId: buildSubjectTiles("corporate-law", 5),
  },
];

export const mockWeekSampleAnswer: Record<string, string> = {
  "week-4":
    "통정허위표시는 상대방과 짜고 진의와 다른 의사표시를 하는 경우이며, 당사자 사이에서는 무효이다.\n제3자에게도 언제나 무효라고 볼 수 있다.\n비진의표시는 통정허위표시와 비슷하지만 상대방이 알았는지 여부가 중요한 차이다.\n착오는 표의자가 스스로 착각해서 표시와 진의가 어긋난 경우로, 통정허위표시와는 성립 요건이 다르다.",
  "week-5":
    "무효는 처음부터 효력이 없는 것이고 취소는 취소권을 행사해야 효력이 없어지는 것이다.\n추인을 하면 무효인 법률행위도 유효하게 된다.",
};

export const mockWeekFeedbackById: Record<string, WeekFeedbackResult> = {
  "feedback-week4-1": {
    id: "feedback-week4-1",
    recallRecordId: "record-week4-1",
    weekId: "week-4",
    answerBlocks: [
      {
        id: "block-1",
        text: "통정허위표시는 진의와 다른 의사표시를 하는 경우이고 무효가 된다.",
        highlights: [
          { phrase: "진의와 다른 의사표시를 하는 경우", status: "partial", hint: "상대방과의 통정 여부가 답안에 드러나지 않습니다." },
        ],
      },
      {
        id: "block-2",
        text: "제3자에게도 무효라고 볼 수 있다.",
        highlights: [
          { phrase: "제3자에게도 무효라고 볼 수 있다", status: "misconception", hint: "선의의 제3자 보호 예외를 다시 확인해보세요." },
        ],
      },
      {
        id: "block-3",
        text: "비진의표시와 비슷하지만 상대방이 알았는지가 중요하다.",
        highlights: [
          { phrase: "상대방이 알았는지가 중요하다", status: "partial", hint: "구별 기준을 조금 더 구체화해보세요." },
        ],
      },
    ],
    missingHints: [
      "성립요건 중 '상대방과의 통정'이 명확히 드러나지 않음",
      "선의의 제3자 보호 예외가 누락됨",
    ],
    verificationQuestions: [
      { id: "q1", type: "reason", question: "통정허위표시가 성립하려면 표의자 혼자 진의와 다른 표시를 하면 충분할까요?" },
      { id: "q2", type: "boundary", question: "당사자 사이에서 무효인 법률행위가 선의의 제3자에게도 언제나 무효라고 볼 수 있을까요?" },
      { id: "q3", type: "comparison", question: "비진의표시와 통정허위표시는 상대방의 인식 또는 합의 측면에서 어떻게 다를까요?" },
    ],
    nextReviewHint: "민법 제108조 1항과 2항을 나누어 다시 백지복습하세요.",
    statusByConceptId: {
      "false-representation": "partial",
      "article-108": "partial",
      collusion: "not_recalled",
      "intent-mismatch": "partial",
      "nullity-between-parties": "misconception",
      "good-faith-third-party": "not_recalled",
      "untrue-intention": "misconception",
    },
  },
  "feedback-week4-2": {
    id: "feedback-week4-2",
    recallRecordId: "record-week4-2",
    weekId: "week-4",
    answerBlocks: [
      {
        id: "block-1",
        text: "통정허위표시는 상대방과 짜고 진의와 다른 의사표시를 하는 경우이며, 당사자 사이에서는 무효이다.",
        highlights: [
          { phrase: "상대방과 짜고 진의와 다른 의사표시를 하는 경우", status: "complete" },
          { phrase: "당사자 사이에서는 무효이다", status: "complete" },
        ],
      },
      {
        id: "block-2",
        text: "제3자에게도 언제나 무효라고 볼 수 있다.",
        highlights: [
          { phrase: "언제나 무효라고 볼 수 있다", status: "misconception", hint: "제3자 보호와 관련해 다시 확인해보세요." },
        ],
      },
      {
        id: "block-3",
        text: "비진의표시는 통정허위표시와 비슷하지만 상대방이 알았는지 여부가 중요한 차이다.",
        highlights: [
          { phrase: "상대방이 알았는지 여부가 중요한 차이다", status: "partial", hint: "구별 기준을 조금 더 구체화해보세요." },
        ],
      },
      {
        id: "block-4",
        text: "착오는 표의자가 스스로 착각해서 표시와 진의가 어긋난 경우로, 통정허위표시와는 성립 요건이 다르다.",
        highlights: [
          { phrase: "통정허위표시와는 성립 요건이 다르다", status: "partial", hint: "착오의 성립요건을 구체적으로 확인해보세요." },
        ],
      },
    ],
    missingHints: [
      "선의의 제3자 보호 요건이 답안에 드러나지 않음",
      "착오의 성립요건(제109조)이 구체적으로 언급되지 않음",
    ],
    verificationQuestions: [
      { id: "q1", type: "boundary", question: "당사자 사이에서 무효인 법률행위가 선의의 제3자에게도 언제나 무효라고 볼 수 있을까요?" },
      { id: "q2", type: "comparison", question: "비진의표시와 통정허위표시는 상대방의 인식 또는 합의 측면에서 어떻게 다를까요?" },
      { id: "q3", type: "reason", question: "착오와 통정허위표시는 표의자의 인식 여부에서 어떤 차이가 있어서 성립요건이 달라질까요?" },
    ],
    nextReviewHint: "선의의 제3자 보호와 착오의 성립요건을 다시 확인해보세요.",
    statusByConceptId: {
      "declaration-of-intent": "complete",
      "false-representation": "partial",
      "article-108": "partial",
      collusion: "partial",
      "intent-mismatch": "complete",
      "nullity-between-parties": "misconception",
      "good-faith-third-party": "not_recalled",
      "untrue-intention": "misconception",
      mistake: "partial",
    },
  },
};

export const mockRecallRecords: RecallRecord[] = [
  {
    id: "record-week4-1",
    subjectId: "civil-law-general",
    weekId: "week-4",
    difficulty: "outline",
    selfAssessments: defaultWeekSelfAssessments["week-4"],
    answerText:
      "통정허위표시는 진의와 다른 의사표시를 하는 경우이고 무효가 된다. 제3자에게도 무효라고 볼 수 있다. 비진의표시와 비슷하지만 상대방이 알았는지가 중요하다.",
    verificationAnswers: {
      q1: "아니요, 상대방과의 통정이 필요할 것 같습니다.",
      q2: "제3자가 선의라면 다를 것 같습니다.",
      q3: "상대방이 알았는지 여부인 것 같습니다.",
    },
    feedbackId: "feedback-week4-1",
    submittedAt: "2026-06-22",
  },
  {
    id: "record-week4-2",
    subjectId: "civil-law-general",
    weekId: "week-4",
    difficulty: "keywords",
    selfAssessments: defaultWeekSelfAssessments["week-4"],
    answerText: mockWeekSampleAnswer["week-4"],
    verificationAnswers: {
      q1: "제3자가 선의인 경우에는 무효를 주장하지 못할 것 같습니다.",
      q2: "상대방과 짜고 하는지, 혼자 하는지의 차이인 것 같습니다.",
      q3: "표의자가 스스로 착각했는지 여부가 다른 것 같습니다.",
    },
    feedbackId: "feedback-week4-2",
    submittedAt: "2026-06-25",
  },
];

// 실시간 데모 제출용 mock 피드백 생성기. week-4는 큐레이션된 데이터를,
// 그 외 주차는 최소 단서형 템플릿을 반환한다.
export function generateMockWeekFeedback(
  weekId: string,
  answerText: string,
  recallRecordId: string
): WeekFeedbackResult {
  if (weekId === "week-4") {
    return {
      ...mockWeekFeedbackById["feedback-week4-2"],
      id: `feedback-${recallRecordId}`,
      recallRecordId,
    };
  }

  const concepts = getWeekConcepts(weekId);
  const blocks: AnnotatedAnswerBlock[] = answerText
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line, i) => ({
      id: `block-${i + 1}`,
      text: line,
      highlights: i === 0 ? [{ phrase: line, status: "partial" as const }] : [],
    }));

  const verificationQuestions: VerificationQuestion[] = [
    { id: "q1", type: "reason", question: `${concepts[0]?.title ?? "핵심 개념"}이 성립하려면 어떤 요건이 필요할까요?` },
    { id: "q2", type: "comparison", question: `${concepts[1]?.title ?? "비교 개념"}은 다른 개념과 어떻게 다를까요?` },
    { id: "q3", type: "boundary", question: `${concepts[2]?.title ?? "관련 개념"}이 적용되는 범위는 어디까지일까요?` },
  ];

  return {
    id: `feedback-${recallRecordId}`,
    recallRecordId,
    weekId,
    answerBlocks: blocks,
    missingHints: concepts.slice(0, 2).map((c) => `${c.title} 관련 내용이 답안에 드러나지 않음`),
    verificationQuestions,
    nextReviewHint: `${concepts[0]?.title ?? "이번 주차"} 관련 자료를 다시 찾아 백지복습하세요.`,
    statusByConceptId: Object.fromEntries(concepts.map((c) => [c.id, "partial" as KnowledgeStatus])),
  };
}
