"use client";

import { useMemo } from "react";
import { useDemoStore } from "@/lib/demo-store";
import { getWeekConcepts } from "@/lib/mock-data";
import type { Subject, WeekConcept } from "@/lib/types";
import { MapLegend } from "./map-legend";
import { MapSnapshotSlider } from "./map-snapshot-slider";
import { WeekDetailPanel } from "./week-detail-panel";
import { WeekExpandedMap } from "./week-expanded-map";
import { WeekMosaicMap } from "./week-mosaic-map";

export function SubjectMapView({ subject }: { subject: Subject }) {
  const selectedMapMode = useDemoStore((s) => s.selectedMapMode);
  const setMapMode = useDemoStore((s) => s.setMapMode);
  const selectedWeekId = useDemoStore((s) => s.selectedWeekId);
  const selectWeek = useDemoStore((s) => s.selectWeek);
  const mapSnapshots = useDemoStore((s) => s.mapSnapshots);
  const selectedSnapshotIndex = useDemoStore((s) => s.selectedSnapshotIndex);
  const setSnapshotIndex = useDemoStore((s) => s.setSnapshotIndex);
  const allWeeks = useDemoStore((s) => s.weeks);
  const weeks = useMemo(
    () => allWeeks.filter((w) => w.subjectId === subject.id),
    [allWeeks, subject.id]
  );

  const subjectSnapshots = useMemo(
    () => mapSnapshots.filter((s) => s.subjectId === subject.id),
    [mapSnapshots, subject.id]
  );
  const clampedIndex = Math.min(selectedSnapshotIndex, subjectSnapshots.length - 1);
  const activeSnapshot = subjectSnapshots[clampedIndex];

  const conceptsByWeek = useMemo(() => {
    const map: Record<string, WeekConcept[]> = {};
    for (const week of weeks) map[week.id] = getWeekConcepts(week.id);
    return map;
  }, [weeks]);

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId) ?? null;

  if (weeks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">아직 업로드된 주차가 없습니다.</p>
        <a href="/upload" className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline">
          자료 업로드 하러 가기 →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMapMode("knowledge")}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              selectedMapMode === "knowledge"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 text-slate-600 hover:border-slate-400"
            }`}
          >
            지식 지도
          </button>
          <button
            type="button"
            onClick={() => setMapMode("metacognition")}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              selectedMapMode === "metacognition"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 text-slate-600 hover:border-slate-400"
            }`}
          >
            메타인지 지도
          </button>
        </div>
        <MapLegend mode={selectedMapMode} />
      </div>

      <MapSnapshotSlider snapshots={subjectSnapshots} index={clampedIndex} onChange={setSnapshotIndex} />

      <WeekMosaicMap
        weeks={weeks}
        conceptsByWeek={conceptsByWeek}
        snapshot={activeSnapshot}
        mode={selectedMapMode}
        selectedWeekId={selectedWeekId}
        onSelectWeek={selectWeek}
      />

      {selectedWeek && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">{selectedWeek.title} 확대</h3>
            <button
              type="button"
              onClick={() => selectWeek(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              접기
            </button>
          </div>
          <WeekExpandedMap
            concepts={conceptsByWeek[selectedWeek.id] ?? []}
            snapshot={activeSnapshot}
            mode={selectedMapMode}
          />
          <WeekDetailPanel week={selectedWeek} />
        </div>
      )}
    </div>
  );
}
