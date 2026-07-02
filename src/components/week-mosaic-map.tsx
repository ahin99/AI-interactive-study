"use client";

import { knowledgeStatusTileClasses, metacognitionTileClass } from "@/lib/level-style";
import { getConceptTile } from "@/lib/scoring";
import type { MapMode, MapSnapshot, StudyWeek, WeekConcept } from "@/lib/types";

export function WeekMosaicMap({
  weeks,
  conceptsByWeek,
  snapshot,
  mode,
  onSelectWeek,
}: {
  weeks: StudyWeek[];
  conceptsByWeek: Record<string, WeekConcept[]>;
  snapshot: MapSnapshot | undefined;
  mode: MapMode;
  onSelectWeek: (weekId: string) => void;
}) {
  const slots = Array.from({ length: 16 }, (_, index) => {
    const weekNumber = index + 1;
    return weeks.find((week) => week.weekNumber === weekNumber) ?? null;
  });

  return (
    <div className="flex justify-center">
      <div
        className="grid aspect-square w-full grid-cols-4 overflow-hidden border border-slate-300 bg-white shadow-sm"
        style={{ maxWidth: "min(55vh, 600px)" }}
      >
      {slots.map((week, index) => {
        if (!week) {
          return (
            <div
              key={`empty-${index}`}
              className="aspect-square border border-slate-100 bg-white"
              title={`${index + 1}주차 · 자료 없음`}
            />
          );
        }

        const concepts = conceptsByWeek[week.id] ?? [];
        const visibleConcepts = concepts.slice(0, 16);
        return (
          <button
            key={week.id}
            type="button"
            onClick={() => onSelectWeek(week.id)}
            title={`${week.weekNumber}주차 · 복습 ${week.reviewCount}회`}
            className="group relative aspect-square border border-slate-200 bg-white p-2 text-left transition-colors hover:bg-slate-50 focus:z-10"
          >
            <div className="grid h-full grid-cols-4 gap-1 pb-7">
              {visibleConcepts.map((concept) => {
                const tile = getConceptTile(snapshot, concept.id);
                const className =
                  mode === "knowledge"
                    ? knowledgeStatusTileClasses[tile.status]
                    : metacognitionTileClass(tile.metacognitionGap);
                return (
                  <span
                    key={concept.id}
                    className={`aspect-square rounded-[2px] opacity-85 ${className}`}
                  />
                );
              })}
              {Array.from({ length: Math.max(0, 16 - visibleConcepts.length) }).map((_, i) => (
                <span key={`blank-${i}`} className="aspect-square rounded-[2px] bg-white" />
              ))}
            </div>
            <div className="absolute inset-x-2 bottom-2 flex items-end justify-between gap-2">
              <span className="truncate text-[11px] font-semibold text-slate-800 sm:text-xs">
                {week.weekNumber}주차
              </span>
              <span className="text-[10px] text-slate-400">복습 {week.reviewCount}</span>
            </div>
          </button>
        );
      })}
      </div>
    </div>
  );
}
