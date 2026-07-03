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
    lastReviewHint: "법률행위와 의사표시 단원을 이어서 백지복습 하세요.",
    materialCount: 16,
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

const civilLawGeneralSyllabus: {
  id: string;
  weekNumber: number;
  topic: string;
  keywords: string[];
}[] = [
  { id: "week-1", weekNumber: 1, topic: "민법의 기초", keywords: ["사법", "공법", "민법의 법원", "성문법", "관습법", "조리", "신의성실", "권리남용", "강행규정", "임의규정", "일반조항", "법률관계", "사적자치", "거래안전", "공서양속", "민법의 체계"] },
  { id: "week-2", weekNumber: 2, topic: "권리와 의무", keywords: ["권리", "의무", "권능", "권한", "청구권", "형성권", "항변권", "지배권", "사권의 분류", "권리행사", "권리보전", "권리충돌", "법률관계", "급부", "책임", "권리변동"] },
  { id: "week-3", weekNumber: 3, topic: "자연인", keywords: ["권리능력", "권리능력의 시기", "권리능력의 종기", "태아", "의사능력", "행위능력", "제한능력자", "미성년자", "피성년후견인", "피한정후견인", "동의", "취소", "주소", "부재", "실종선고", "동시사망"] },
  { id: "week-4", weekNumber: 4, topic: "의사표시와 착오", keywords: ["의사표시", "효과의사", "표시행위", "진의", "비진의표시", "통정허위표시", "착오", "중요부분", "중대한 과실", "사기", "강박", "도달주의", "수령능력", "해석", "하자", "제3자 보호"] },
  { id: "week-5", weekNumber: 5, topic: "무효와 취소", keywords: ["무효", "취소", "절대적 무효", "상대적 무효", "일부무효", "유동적 무효", "추인", "무효행위 전환", "취소권자", "취소의 효과", "법정추인", "제척기간", "소급효", "선의의 제3자", "부당이득", "효력확정"] },
  { id: "week-6", weekNumber: 6, topic: "법인", keywords: ["법인격", "사단법인", "재단법인", "정관", "설립등기", "기관", "이사", "감사", "사원총회", "대표", "목적범위", "불법행위능력", "비법인사단", "총유", "해산", "청산"] },
  { id: "week-7", weekNumber: 7, topic: "권리의 객체", keywords: ["물건", "유체물", "관리 가능한 자연력", "부동산", "동산", "주물", "종물", "원물", "과실", "천연과실", "법정과실", "분리", "독립성", "일물일권주의", "물건의 일부", "권리의 객체"] },
  { id: "week-8", weekNumber: 8, topic: "법률행위", keywords: ["법률행위", "의사표시", "계약", "단독행위", "합동행위", "요건", "목적", "확정성", "가능성", "적법성", "사회적 타당성", "공서양속", "불공정행위", "동기", "해석", "효력"] },
  { id: "week-9", weekNumber: 9, topic: "대리", keywords: ["대리권", "본인", "대리인", "상대방", "현명주의", "대리행위", "수권행위", "대리권 남용", "복대리", "무권대리", "표현대리", "추인", "철회", "상대방 보호", "자기계약", "쌍방대리"] },
  { id: "week-10", weekNumber: 10, topic: "조건과 기한", keywords: ["조건", "기한", "정지조건", "해제조건", "시기", "종기", "불능조건", "불법조건", "기성조건", "조건성취", "조건불성취", "기한의 이익", "기한이익 상실", "소급효", "장래효", "부관"] },
  { id: "week-11", weekNumber: 11, topic: "기간", keywords: ["기간", "기간계산", "초일불산입", "초일산입", "역법", "만료점", "기간말일", "공휴일", "연령계산", "시효기간", "제척기간", "기산점", "기간연장", "기간단축", "도달", "효력발생"] },
  { id: "week-12", weekNumber: 12, topic: "소멸시효 기초", keywords: ["소멸시효", "취득시효", "시효기간", "기산점", "권리행사 가능성", "채권", "소유권", "형성권", "원용", "시효이익", "포기", "소급효", "제척기간", "시효완성", "소멸효", "권리불행사"] },
  { id: "week-13", weekNumber: 13, topic: "소멸시효 중단과 정지", keywords: ["시효중단", "청구", "재판상 청구", "압류", "가압류", "가처분", "승인", "최고", "중단효", "재진행", "시효정지", "장애사유", "완성유예", "당사자", "보증인", "시효관리"] },
  { id: "week-14", weekNumber: 14, topic: "권리행사와 항변", keywords: ["항변권", "동시이행", "상계", "유치", "권리보전", "기한항변", "소멸시효 항변", "신의칙 항변", "권리남용 항변", "급부거절", "방어방법", "행사요건", "효과", "상대방", "이익형량", "사례검토"] },
  { id: "week-15", weekNumber: 15, topic: "민법총칙 사례정리", keywords: ["사례분석", "요건검토", "효과정리", "쟁점추출", "개념비교", "권리주체", "법률행위", "의사표시", "대리", "무효", "취소", "조건", "기한", "시효", "항변", "답안구성"] },
  { id: "week-16", weekNumber: 16, topic: "기말 종합정리", keywords: ["총칙체계", "민법원리", "권리주체", "권리객체", "법률행위", "의사표시", "하자", "무효", "취소", "대리", "조건", "기한", "기간", "소멸시효", "사례형", "종합정리"] },
];

const civilLawGeneralWeeks: StudyWeek[] = civilLawGeneralSyllabus.map((week) => ({
  id: week.id,
  subjectId: "civil-law-general",
  weekNumber: week.weekNumber,
  title: `${week.weekNumber}주차 · ${week.topic}`,
  materialIds: [`mat-week${week.weekNumber}-1`],
  reviewCount: 5,
}));

const civilLawGeneralMaterials: WeekMaterial[] = civilLawGeneralSyllabus.map((week) => ({
  id: `mat-week${week.weekNumber}-1`,
  subjectId: "civil-law-general",
  weekId: week.id,
  displayName: `민법총칙 ${week.weekNumber}주차 핵심 키워드`,
  fileName: `민법총칙_${String(week.weekNumber).padStart(2, "0")}주차_키워드.txt`,
  uploadedAt: "2026-07-03",
  status: "analyzed",
}));

const civilLawGeneralKeywordConcepts: WeekConcept[] = civilLawGeneralSyllabus
  .flatMap((week) =>
    week.keywords.map((keyword, index) => ({
      id: `${week.id}-concept-${index + 1}`,
      weekId: week.id,
      title: keyword,
      type: index === 0 ? "main_concept" : index % 5 === 1 ? "requirement" : index % 5 === 2 ? "effect" : index % 5 === 3 ? "exception" : "comparison",
      outlineLabel: week.topic,
      keyword,
    }))
  );

export const mockWeeks: StudyWeek[] = [
  ...civilLawGeneralWeeks,
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
  ...civilLawGeneralMaterials,
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
  ...civilLawGeneralKeywordConcepts,
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
  "week-1": ["사법", "신의성실", "권리남용"],
  "week-2": ["권리", "의무", "법률관계"],
  "week-3": ["권리능력", "행위능력", "제한능력자"],
  "week-4": ["통정허위표시", "비진의표시", "착오"],
  "week-5": ["무효", "취소", "추인"],
  "week-6": ["법인격", "정관", "대표"],
  "week-7": ["물건", "부동산", "종물"],
  "week-8": ["법률행위", "의사표시", "계약"],
  "week-9": ["대리권", "무권대리", "표현대리"],
  "week-10": ["조건", "기한", "기한의 이익"],
  "week-11": ["기간계산", "초일불산입", "기간만료"],
  "week-12": ["소멸시효", "기산점", "시효이익"],
  "week-13": ["청구", "승인", "시효정지"],
  "week-14": ["항변권", "상계", "권리보전"],
  "week-15": ["사례분석", "쟁점추출", "개념비교"],
  "week-16": ["총칙체계", "법률행위", "시효"],
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
  "week-7": [
    { conceptId: "week-7-concept-1", predictedKnown: true },
    { conceptId: "week-7-concept-4", predictedKnown: true },
    { conceptId: "week-7-concept-6", predictedKnown: true },
  ],
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

function buildCivilLawDemoTiles(reviewNumber: number): MapSnapshot["tilesByConceptId"] {
  const weekIds = civilLawGeneralSyllabus.map((week) => week.id);
  const conceptIds = mockWeekConcepts
    .filter((concept) => weekIds.includes(concept.weekId))
    .map((concept) => concept.id);
  const statusByReview: KnowledgeStatus[][] = [
    ["unreviewed", "not_recalled", "not_recalled", "misconception", "unreviewed", "partial", "not_recalled", "misconception"],
    ["not_recalled", "misconception", "partial", "unreviewed", "partial", "not_recalled", "misconception", "partial"],
    ["misconception", "partial", "partial", "complete", "not_recalled", "partial", "misconception", "complete"],
    ["partial", "complete", "partial", "misconception", "complete", "partial", "complete", "not_recalled"],
    ["complete", "partial", "complete", "partial", "complete", "misconception", "complete", "partial"],
  ];
  const metacognitionBaseByReview = [88, 72, 56, 42, 28];
  const statuses = statusByReview[reviewNumber - 1] ?? statusByReview[4];
  const baseGap = metacognitionBaseByReview[reviewNumber - 1] ?? 28;

  return Object.fromEntries(
    conceptIds.map((conceptId, index) => {
      const weekNumber = Math.floor(index / 16) + 1;
      const position = index % 16;
      const row = Math.floor(position / 4);
      const col = position % 4;
      const mosaicIndex = (position * 7 + row * 3 + col * 5 + weekNumber * 11 + reviewNumber * 13) % statuses.length;
      const status = statuses[mosaicIndex];
      const metacognitionGap = status === "unreviewed" ? null : Math.max(12, Math.min(96, baseGap + ((index * 7) % 24) - 8));
      return [conceptId, { conceptId, status, metacognitionGap }];
    })
  );
}

const civilLawDemoSnapshots: MapSnapshot[] = Array.from({ length: 5 }, (_, index) => {
  const reviewNumber = index + 1;
  return {
    id: reviewNumber === 5 ? "snapshot-civil-law-current" : `snapshot-civil-law-${reviewNumber}`,
    subjectId: "civil-law-general",
    label: reviewNumber === 5 ? "현재(5회차)" : `${reviewNumber}회차`,
    reviewNumber,
    createdAt: `2026-06-${String(18 + index * 3).padStart(2, "0")}`,
    tilesByConceptId: buildCivilLawDemoTiles(reviewNumber),
  };
});

export const mockKnowledgeSnapshots: MapSnapshot[] = [
  ...civilLawDemoSnapshots,
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
  "week-7":
    "권리의 객체는 권리의 내용이 향하는 대상으로, 민법총칙에서는 특히 물건 개념을 중심으로 정리할 수 있다. 물건은 유체물뿐 아니라 관리할 수 있는 자연력도 포함하고, 거래와 권리관계에서는 독립한 물건인지가 중요하다. 부동산은 토지와 그 정착물이고, 동산은 그 밖의 물건으로 구분된다. 주물과 종물은 경제적 이용관계에 따라 함께 다루어질 수 있고, 원물과 과실은 수익이 어디에서 나오는지에 따라 나뉜다. 천연과실과 법정과실은 발생 방식이 다르며, 과실은 분리 시점과 귀속 문제를 함께 보아야 한다. 결국 7주차는 물건의 종류, 독립성, 종물 관계, 과실 개념을 구별하는 것이 핵심이다.",
};

const week7HistoryAnswers = [
  "권리의 객체는 권리가 미치는 대상이고 물건이 대표적이다. 부동산과 동산을 구분하고, 주물과 종물은 같이 쓰이는 물건 정도로 이해했다.",
  "물건은 유체물만 의미하는 것이 아니라 관리 가능한 자연력도 포함한다. 부동산은 토지와 정착물이고 동산은 그 외의 물건이다.",
  "주물과 종물은 경제적 관계가 있고, 원물과 과실은 수익 발생 관계로 구분된다. 다만 과실의 종류와 귀속 시점은 아직 헷갈린다.",
  "권리의 객체 단원에서는 물건의 독립성, 부동산과 동산, 주물과 종물, 원물과 과실을 구별해야 한다. 특히 종물은 주물의 처분을 따르는지가 문제된다.",
  "물건은 권리의 객체가 되는 기본 단위이고, 독립성이 중요하다. 부동산과 동산, 주물과 종물, 원물과 천연과실·법정과실을 구별해 사례에 적용해야 한다.",
];

const week7HistoryFeedback: Record<string, WeekFeedbackResult> = Object.fromEntries(
  week7HistoryAnswers.map((answer, index) => {
    const round = index + 1;
    const recordId = `record-week7-${round}`;
    return [
      `feedback-week7-${round}`,
      {
        id: `feedback-week7-${round}`,
        recallRecordId: recordId,
        weekId: "week-7",
        answerBlocks: [
          {
            id: `block-week7-${round}`,
            text: answer,
            highlights: [
              {
                phrase: answer.split(".")[0] || answer,
                status: round <= 2 ? "partial" : "complete",
                hint: round <= 3 ? "물건의 독립성과 과실의 구별을 더 분리해보세요." : undefined,
              },
            ],
          },
        ],
        missingHints:
          round <= 2
            ? ["관리 가능한 자연력의 위치를 다시 확인", "원물과 과실의 구별 기준 보완"]
            : round <= 4
              ? ["과실 귀속 시점과 분리 개념 보완"]
              : ["사례에서 주물·종물과 과실을 함께 묻는 경우 대비"],
        verificationQuestions: [
          { id: "q1", type: "comparison", question: "부동산과 동산은 어떤 기준으로 나누나요?", targetConceptTitles: ["부동산", "동산"] },
          { id: "q2", type: "boundary", question: "종물이 주물과 함께 다루어지는 경계는 어디인가요?", targetConceptTitles: ["주물", "종물"] },
          { id: "q3", type: "reason", question: "천연과실과 법정과실을 구별해야 하는 이유는 무엇인가요?", targetConceptTitles: ["천연과실", "법정과실"] },
        ],
        nextReviewHint:
          round <= 2
            ? "물건의 정의와 부동산·동산 구별부터 다시 백지복습하세요."
            : round <= 4
              ? "주물·종물, 원물·과실을 서로 비교해 다시 설명하세요."
              : "사례에서 물건의 독립성과 과실 귀속을 함께 점검하세요.",
        statusByConceptId: {
          "week-7-concept-1": round >= 3 ? "complete" : "partial",
          "week-7-concept-4": round >= 4 ? "complete" : "partial",
          "week-7-concept-6": round >= 5 ? "complete" : "misconception",
          "week-7-concept-9": round >= 4 ? "partial" : "not_recalled",
          "week-7-concept-10": round >= 5 ? "partial" : "not_recalled",
          "week-7-concept-11": round >= 5 ? "partial" : "not_recalled",
        },
      } satisfies WeekFeedbackResult,
    ];
  })
);

const week7HistoryRecords: RecallRecord[] = week7HistoryAnswers.map((answer, index) => {
  const round = index + 1;
  return {
    id: `record-week7-${round}`,
    subjectId: "civil-law-general",
    weekId: "week-7",
    difficulty: round % 3 === 1 ? "outline" : round % 3 === 2 ? "keywords" : "blank",
    selfAssessments: defaultWeekSelfAssessments["week-7"],
    answerText: answer,
    verificationAnswers: {
      q1: "부동산은 토지와 정착물이고 동산은 그 외의 물건입니다.",
      q2: "주물의 경제적 이용을 돕는 관계인지가 중요합니다.",
      q3: "수익의 발생 방식과 귀속을 구별하기 위해서입니다.",
    },
    feedbackId: `feedback-week7-${round}`,
    submittedAt: `2026-06-${String(14 + round * 3).padStart(2, "0")}`,
  };
});

export const mockWeekFeedbackById: Record<string, WeekFeedbackResult> = {
  ...week7HistoryFeedback,
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
  ...week7HistoryRecords,
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
