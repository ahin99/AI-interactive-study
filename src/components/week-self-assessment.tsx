"use client";

import { useDemoStore } from "@/lib/demo-store";
import { typeLabel } from "@/lib/level-style";
import type { ConceptType, WeekConcept } from "@/lib/types";

const groupOrder: ConceptType[] = [
  "main_concept",
  "statute",
  "requirement",
  "effect",
  "exception",
  "case",
  "comparison",
];

export function WeekSelfAssessment({
  weekId,
  concepts,
}: {
  weekId: string;
  concepts: WeekConcept[];
}) {
  const assessments = useDemoStore((s) => s.weekSelfAssessments[weekId] ?? []);
  const toggle = useDemoStore((s) => s.toggleWeekSelfAssessment);
  const grouped = groupOrder
    .map((type) => ({ type, concepts: concepts.filter((concept) => concept.type === type) }))
    .filter((group) => group.concepts.length > 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-slate-900">
        알고 있다고 생각하는 개념을 체크하세요.
      </p>
      <div className="space-y-4">
        {grouped.map(({ type, concepts: groupConcepts }, groupIndex) => (
          <section key={type} className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[120px_1fr]">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                {groupIndex + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{typeLabel[type]}</h3>
                <p className="mt-0.5 text-xs text-slate-400">{groupConcepts.length}개 개념</p>
              </div>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {groupConcepts.map((concept, conceptIndex) => {
                  const known =
                    assessments.find((a) => a.conceptId === concept.id)?.predictedKnown ?? false;
                  return (
                    <label
                      key={concept.id}
                      className="flex items-center gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100"
                    >
                      <span className="w-8 shrink-0 font-mono text-xs font-semibold text-slate-400">
                        {groupIndex + 1}.{conceptIndex + 1}
                      </span>
                      <input
                        type="checkbox"
                        checked={known}
                        onChange={() => toggle(weekId, concept.id)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-slate-800">{concept.title}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
