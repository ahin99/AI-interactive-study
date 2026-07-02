"use client";

import { useDemoStore } from "@/lib/demo-store";
import { getWeekConcepts, mockWeekKeywords } from "@/lib/mock-data";
import type { RecallDifficulty } from "@/lib/types";

const difficultyInfo: Record<RecallDifficulty, string> = {
  outline: "목차 전체",
  keywords: "핵심 키워드 3개",
  blank: "완전 백지",
};

export function RecallDifficultySelector({ weekId }: { weekId: string }) {
  const difficulty = useDemoStore((s) => s.recallDifficulty);
  const setDifficulty = useDemoStore((s) => s.setRecallDifficulty);
  const concepts = getWeekConcepts(weekId);
  const keywords = mockWeekKeywords[weekId] ?? [];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["outline", "keywords", "blank"] as RecallDifficulty[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDifficulty(d)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              difficulty === d
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 text-slate-600 hover:border-slate-400"
            }`}
          >
            {difficultyInfo[d]}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        {difficulty === "blank" && (
          <p className="text-slate-400">단서 없음 — 완전 백지 상태에서 작성하세요.</p>
        )}
        {difficulty === "outline" && (
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">목차 전체</p>
            <ul className="list-disc pl-5 text-slate-700">
              {concepts.map((c) => (
                <li key={c.id}>{c.title}</li>
              ))}
            </ul>
          </div>
        )}
        {difficulty === "keywords" && (
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">핵심 키워드 3개</p>
            <ul className="list-disc pl-5 text-slate-700">
              {keywords.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
