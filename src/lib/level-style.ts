import type { ConceptType, KnowledgeStatus, UnderstandingLevel } from "./types";

export const levelLabel: Record<UnderstandingLevel, string> = {
  complete: "완전히 설명 가능",
  partial: "부분적으로 설명 가능",
  misconception: "오개념 포함",
  missing: "설명하지 못함",
};

export const levelClasses: Record<UnderstandingLevel, string> = {
  complete: "bg-green-100 text-green-800 border-green-300",
  partial: "bg-yellow-100 text-yellow-800 border-yellow-300",
  misconception: "bg-orange-100 text-orange-800 border-orange-300",
  missing: "bg-red-100 text-red-800 border-red-300",
};

export const levelDot: Record<UnderstandingLevel, string> = {
  complete: "bg-green-500",
  partial: "bg-yellow-500",
  misconception: "bg-orange-500",
  missing: "bg-red-500",
};

export const typeLabel: Record<ConceptType, string> = {
  unit: "단원",
  main_concept: "핵심개념",
  statute: "조문",
  requirement: "요건",
  effect: "효과",
  exception: "예외",
  case: "판례",
  comparison: "비교개념",
};

export const typeClasses: Record<ConceptType, string> = {
  unit: "bg-slate-100 text-slate-700",
  main_concept: "bg-indigo-100 text-indigo-700",
  statute: "bg-sky-100 text-sky-700",
  requirement: "bg-teal-100 text-teal-700",
  effect: "bg-cyan-100 text-cyan-700",
  exception: "bg-purple-100 text-purple-700",
  case: "bg-fuchsia-100 text-fuchsia-700",
  comparison: "bg-amber-100 text-amber-700",
};

// ---- 지식 지도 5상태 색상 ----

export const knowledgeStatusLabel: Record<KnowledgeStatus, string> = {
  unreviewed: "미복습",
  not_recalled: "전혀 설명 못함",
  misconception: "오개념 포함",
  partial: "일부 누락",
  complete: "정확히 설명함",
};

export const knowledgeStatusTileClasses: Record<KnowledgeStatus, string> = {
  unreviewed: "bg-slate-200",
  not_recalled: "bg-red-400",
  misconception: "bg-orange-400",
  partial: "bg-yellow-400",
  complete: "bg-green-500",
};

export const knowledgeStatusLegendClasses: Record<KnowledgeStatus, string> = {
  unreviewed: "bg-slate-300",
  not_recalled: "bg-red-400",
  misconception: "bg-orange-400",
  partial: "bg-yellow-400",
  complete: "bg-green-500",
};

// ---- 메타인지 지도 핑크 색상 ----
// null(미측정)은 회색, 값이 클수록(과대평가 오차가 클수록) 짙은 핑크

export function metacognitionTileClass(gap: number | null): string {
  if (gap === null) return "bg-slate-200";
  if (gap <= 40) return "bg-pink-200";
  if (gap <= 70) return "bg-pink-400";
  return "bg-pink-600";
}

export const metacognitionLegend: { label: string; className: string }[] = [
  { label: "미측정", className: "bg-slate-300" },
  { label: "과대평가 오차 작음 (1-40)", className: "bg-pink-200" },
  { label: "과대평가 오차 중간 (41-70)", className: "bg-pink-400" },
  { label: "과대평가 오차 큼 (71-100)", className: "bg-pink-600" },
];
