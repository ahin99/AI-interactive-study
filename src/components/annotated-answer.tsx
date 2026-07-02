import type { AnnotatedAnswerBlock } from "@/lib/types";

const highlightClasses: Record<string, string> = {
  misconception: "bg-orange-200",
  partial: "bg-yellow-200",
  complete: "bg-green-200",
};

// 주황 > 노랑 > 초록 우선순위
const priority: Record<string, number> = { misconception: 0, partial: 1, complete: 2 };

function renderBlock(block: AnnotatedAnswerBlock) {
  if (block.highlights.length === 0) {
    return <span>{block.text}</span>;
  }

  const matches = block.highlights
    .map((h) => ({ ...h, index: block.text.indexOf(h.phrase) }))
    .filter((h) => h.index >= 0)
    .sort((a, b) => a.index - b.index || priority[a.status] - priority[b.status]);

  const segments: { text: string; highlight?: (typeof matches)[number] }[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.index < cursor) continue;
    if (match.index > cursor) segments.push({ text: block.text.slice(cursor, match.index) });
    segments.push({ text: match.phrase, highlight: match });
    cursor = match.index + match.phrase.length;
  }
  if (cursor < block.text.length) segments.push({ text: block.text.slice(cursor) });

  return (
    <>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <mark
            key={i}
            title={seg.highlight.hint}
            className={`rounded px-0.5 ${highlightClasses[seg.highlight.status]}`}
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

export function AnnotatedAnswer({ blocks }: { blocks: AnnotatedAnswerBlock[] }) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800">
      {blocks.map((block) => (
        <p key={block.id}>{renderBlock(block)}</p>
      ))}
    </div>
  );
}
