import {
  knowledgeStatusLabel,
  knowledgeStatusLegendClasses,
  metacognitionLegend,
} from "@/lib/level-style";
import type { KnowledgeStatus, MapMode } from "@/lib/types";

const knowledgeOrder: KnowledgeStatus[] = [
  "unreviewed",
  "not_recalled",
  "misconception",
  "partial",
  "complete",
];

export function MapLegend({ mode }: { mode: MapMode }) {
  if (mode === "knowledge") {
    return (
      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        {knowledgeOrder.map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${knowledgeStatusLegendClasses[status]}`} />
            {knowledgeStatusLabel[status]}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-600">
      {metacognitionLegend.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${item.className}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
