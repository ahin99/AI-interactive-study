"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useDemoStore } from "@/lib/demo-store";
import { typeClasses, typeLabel } from "@/lib/level-style";
import type { ConceptNode } from "@/lib/types";

function ConceptRow({ node, depth }: { node: ConceptNode; depth: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isUnit = node.type === "unit";

  const selfAssessments = useDemoStore((s) => s.selfAssessments);
  const toggleSelfAssessment = useDemoStore((s) => s.toggleSelfAssessment);
  const selectedConceptId = useDemoStore((s) => s.selectedConceptId);
  const setSelectedConceptId = useDemoStore((s) => s.setSelectedConceptId);

  const predictedKnown =
    selfAssessments.find((a) => a.conceptId === node.id)?.predictedKnown ?? false;
  const isSelected = selectedConceptId === node.id;

  return (
    <div>
      <div
        style={{ paddingLeft: depth * 20 }}
        className={`flex items-center gap-2 rounded-md py-1.5 pr-2 ${
          isSelected ? "bg-teal-50 ring-1 ring-teal-300" : "hover:bg-slate-50"
        }`}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-slate-400"
            aria-label="펼치기/접기"
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <span className="w-4" />
        )}

        {!isUnit && (
          <input
            type="checkbox"
            checked={predictedKnown}
            onChange={() => toggleSelfAssessment(node.id)}
            title="알고 있다고 생각함"
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
        )}

        <button
          type="button"
          onClick={() => !isUnit && setSelectedConceptId(node.id)}
          className={`flex flex-1 items-center gap-2 truncate text-left ${
            isUnit ? "font-semibold text-slate-900" : "text-slate-800"
          }`}
        >
          <span className="truncate">{node.title}</span>
          {!isUnit && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${typeClasses[node.type]}`}
            >
              {typeLabel[node.type]}
            </span>
          )}
        </button>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <ConceptRow key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ConceptTree({ root }: { root: ConceptNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <ConceptRow node={root} depth={0} />
    </div>
  );
}
