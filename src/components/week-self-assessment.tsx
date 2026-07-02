"use client";

import { useDemoStore } from "@/lib/demo-store";
import type { WeekConcept } from "@/lib/types";

export function WeekSelfAssessment({
  weekId,
  concepts,
}: {
  weekId: string;
  concepts: WeekConcept[];
}) {
  const assessments = useDemoStore((s) => s.weekSelfAssessments[weekId] ?? []);
  const toggle = useDemoStore((s) => s.toggleWeekSelfAssessment);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-2 text-xs font-medium text-slate-500">
        알고 있다고 생각하는 개념을 체크하세요.
      </p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {concepts.map((concept) => {
          const known =
            assessments.find((a) => a.conceptId === concept.id)?.predictedKnown ?? false;
          return (
            <label
              key={concept.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={known}
                onChange={() => toggle(weekId, concept.id)}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              {concept.title}
            </label>
          );
        })}
      </div>
    </div>
  );
}
