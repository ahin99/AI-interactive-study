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
      {blocks.map((block, index) => {
        const feedbackLines = block.highlights
          .map((highlight) => {
            if (highlight.hint) return highlight.hint;
            if (highlight.status === "complete") return "핵심 내용이 적절히 포함되었습니다.";
            if (highlight.status === "partial") return "내용은 맞지만 성립요건이나 효과를 더 구체화해야 합니다.";
            return "오개념 가능성이 있어 조문 또는 판례 기준을 다시 확인해야 합니다.";
          })
          .filter((line, i, lines) => lines.indexOf(line) === i);

        return (
          <div key={block.id} className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-400">답안 {index + 1}</p>
            <p className="mt-1">{renderBlock(block)}</p>
            {feedbackLines.length > 0 && (
              <div className="mt-2 space-y-1 border-t border-slate-200 pt-2">
                {feedbackLines.map((line) => (
                  <p key={line} className="text-xs leading-5 text-slate-600">
                    피드백: {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
