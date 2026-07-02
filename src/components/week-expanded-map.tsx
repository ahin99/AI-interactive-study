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
  const visibleConcepts = concepts.slice(0, 16);
  const emptyCount = Math.max(0, 16 - visibleConcepts.length);

  return (
    <div className="grid aspect-square grid-cols-4 overflow-hidden border border-slate-300 bg-white shadow-sm">
      {visibleConcepts.map((concept) => {
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
            className={`flex aspect-square flex-col justify-between border border-white/60 p-2 text-xs font-medium text-slate-900 sm:p-3 sm:text-sm ${className}`}
          >
            <span className="leading-snug">{concept.title}</span>
          </div>
        );
      })}
      {Array.from({ length: emptyCount }).map((_, index) => (
        <div key={`empty-${index}`} className="aspect-square border border-slate-100 bg-white" />
      ))}
    </div>
  );
}
