import type { ConceptMapTile, MapSnapshot, SelfAssessment, UnderstandingLevel } from "./types";

export function calculateCompletionRate(
  levels: Record<string, UnderstandingLevel>
): number {
  const values = Object.values(levels);
  if (values.length === 0) return 0;
  const complete = values.filter((v) => v === "complete").length;
  return Math.round((complete / values.length) * 100);
}

export function calculateMetacognitionGapRate(
  assessments: SelfAssessment[],
  levels: Record<string, UnderstandingLevel>
): number {
  const predictedKnown = assessments.filter((a) => a.predictedKnown);
  if (predictedKnown.length === 0) return 0;
  const overestimated = predictedKnown.filter(
    (a) => levels[a.conceptId] !== "complete"
  );
  return Math.round((overestimated.length / predictedKnown.length) * 100);
}

export function getOverestimatedConceptIds(
  assessments: SelfAssessment[],
  levels: Record<string, UnderstandingLevel>
): string[] {
  return assessments
    .filter((a) => a.predictedKnown && levels[a.conceptId] !== "complete")
    .map((a) => a.conceptId);
}

// ---- 주차/과목 지도 조회 함수 (정교한 공식 없이 mock snapshot 기반) ----

export function getLatestSnapshot(
  snapshots: MapSnapshot[],
  subjectId: string
): MapSnapshot | undefined {
  const subjectSnapshots = snapshots.filter((s) => s.subjectId === subjectId);
  return subjectSnapshots[subjectSnapshots.length - 1];
}

export function getConceptTile(
  snapshot: MapSnapshot | undefined,
  conceptId: string
): ConceptMapTile {
  return (
    snapshot?.tilesByConceptId[conceptId] ?? {
      conceptId,
      status: "unreviewed",
      metacognitionGap: null,
    }
  );
}

export function calculateWeekCompletionRate(
  snapshot: MapSnapshot | undefined,
  conceptIds: string[]
): number {
  if (conceptIds.length === 0) return 0;
  const complete = conceptIds.filter(
    (id) => getConceptTile(snapshot, id).status === "complete"
  ).length;
  return Math.round((complete / conceptIds.length) * 100);
}
