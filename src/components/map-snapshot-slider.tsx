"use client";

import type { MapSnapshot } from "@/lib/types";

export function MapSnapshotSlider({
  snapshots,
  index,
  onChange,
}: {
  snapshots: MapSnapshot[];
  index: number;
  onChange: (index: number) => void;
}) {
  if (snapshots.length === 0) return null;
  const current = snapshots[index] ?? snapshots[snapshots.length - 1];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-900">{current.label}</span>
        <span className="text-xs text-slate-400">{current.createdAt}</span>
      </div>
      <input
        type="range"
        min={0}
        max={snapshots.length - 1}
        step={1}
        value={index}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-slate-900"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        {snapshots.map((s) => (
          <span key={s.id}>{s.label}</span>
        ))}
      </div>
    </div>
  );
}
