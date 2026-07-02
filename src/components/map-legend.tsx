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
      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        {knowledgeOrder.map((status) => (
          <span key={status} className="flex items-center gap-2">
            <span className={`h-3.5 w-3.5 rounded-full ${knowledgeStatusLegendClasses[status]}`} />
            {knowledgeStatusLabel[status]}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
      {metacognitionLegend.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          <span className={`h-3.5 w-3.5 rounded-full ${item.className}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
