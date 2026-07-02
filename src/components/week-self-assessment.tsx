"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    main_concept: true,
    requirement: true,
  });
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
      <div className="space-y-2">
        {grouped.map(({ type, concepts: groupConcepts }) => {
          const isOpen = openGroups[type] ?? false;
          return (
            <div key={type} className="rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setOpenGroups((prev) => ({ ...prev, [type]: !isOpen }))}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  {typeLabel[type]}
                </span>
                <span className="text-xs text-slate-400">{groupConcepts.length}개</span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-3 py-2">
                  <div className="grid gap-1 sm:grid-cols-2">
                    {groupConcepts.map((concept) => {
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
                          <span>{concept.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
