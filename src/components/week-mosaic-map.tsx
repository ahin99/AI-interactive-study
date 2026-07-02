"use client";

import { knowledgeStatusTileClasses, metacognitionTileClass } from "@/lib/level-style";
import { getConceptTile } from "@/lib/scoring";
import type { MapMode, MapSnapshot, StudyWeek, WeekConcept } from "@/lib/types";

export function WeekMosaicMap({
  weeks,
  conceptsByWeek,
  snapshot,
  mode,
  selectedWeekId,
  onSelectWeek,
}: {
  weeks: StudyWeek[];
  conceptsByWeek: Record<string, WeekConcept[]>;
  snapshot: MapSnapshot | undefined;
  mode: MapMode;
  selectedWeekId: string | null;
  onSelectWeek: (weekId: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {weeks.map((week) => {
        const concepts = conceptsByWeek[week.id] ?? [];
        const isSelected = week.id === selectedWeekId;
        return (
          <button
            key={week.id}
            type="button"
            onClick={() => onSelectWeek(week.id)}
            title={`${week.weekNumber}주차 · 복습 ${week.reviewCount}회`}
            className={`rounded-xl border bg-white p-4 text-left transition-all ${
              isSelected
                ? "border-slate-900 ring-2 ring-slate-900"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-medium text-slate-900">{week.title}</p>
              <span className="text-xs text-slate-400">복습 {week.reviewCount}회</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {concepts.map((concept) => {
                const tile = getConceptTile(snapshot, concept.id);
                const className =
                  mode === "knowledge"
                    ? knowledgeStatusTileClasses[tile.status]
                    : metacognitionTileClass(tile.metacognitionGap);
                return (
                  <span key={concept.id} className={`aspect-square rounded-sm ${className}`} />
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
