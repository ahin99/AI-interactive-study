"use client";

import {
  knowledgeStatusLabel,
  knowledgeStatusTileClasses,
  metacognitionTileClass,
} from "@/lib/level-style";
import { getConceptTile } from "@/lib/scoring";
import type { MapMode, MapSnapshot, WeekConcept } from "@/lib/types";

export function WeekExpandedMap({
  concepts,
  snapshot,
  mode,
}: {
  concepts: WeekConcept[];
  snapshot: MapSnapshot | undefined;
  mode: MapMode;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {concepts.map((concept) => {
        const tile = getConceptTile(snapshot, concept.id);
        const className =
          mode === "knowledge"
            ? knowledgeStatusTileClasses[tile.status]
            : metacognitionTileClass(tile.metacognitionGap);
        const hint =
          mode === "knowledge"
            ? knowledgeStatusLabel[tile.status]
            : tile.metacognitionGap === null
            ? "미측정"
            : `과대평가 오차 ${tile.metacognitionGap}`;
        return (
          <div
            key={concept.id}
            title={hint}
            className={`flex min-h-[72px] flex-col justify-between rounded-lg p-3 text-sm font-medium text-slate-900 transition-transform ${className}`}
          >
            <span className="leading-snug">{concept.title}</span>
          </div>
        );
      })}
    </div>
  );
}
