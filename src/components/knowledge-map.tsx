import { levelClasses, levelDot, levelLabel, typeLabel } from "@/lib/level-style";
import type { ConceptNode, UnderstandingLevel } from "@/lib/types";

export function KnowledgeMap({
  concepts,
  levels,
  overestimatedIds,
}: {
  concepts: ConceptNode[];
  levels: Record<string, UnderstandingLevel>;
  overestimatedIds: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-xs">
        {(Object.keys(levelLabel) as UnderstandingLevel[]).map((level) => (
          <span key={level} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${levelDot[level]}`} />
            {levelLabel[level]}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-purple-700">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
          과대평가
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {concepts.map((concept) => {
          const level = levels[concept.id] ?? "missing";
          const overestimated = overestimatedIds.includes(concept.id);
          return (
            <div
              key={concept.id}
              className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${levelClasses[level]} ${
                overestimated ? "ring-2 ring-purple-400" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{concept.title}</p>
                <p className="text-xs opacity-70">{typeLabel[concept.type]}</p>
              </div>
              <span className="ml-2 shrink-0 text-xs">{levelLabel[level]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
