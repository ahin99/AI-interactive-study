import { AlertTriangle, CircleHelp, ListChecks, MapPinned } from "lucide-react";
import type { FeedbackResult } from "@/lib/types";

function Section({
  icon,
  title,
  items,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  tone: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className={`rounded-lg border p-4 ${tone}`}>
      <div className="mb-2 flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </div>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function FeedbackPanel({ feedback }: { feedback: FeedbackResult }) {
  return (
    <div className="space-y-3">
      <Section
        icon={<ListChecks className="h-4 w-4" />}
        title="누락"
        items={feedback.missingPoints}
        tone="border-red-200 bg-red-50 text-red-800"
      />
      <Section
        icon={<AlertTriangle className="h-4 w-4" />}
        title="혼동"
        items={feedback.misconceptions}
        tone="border-orange-200 bg-orange-50 text-orange-800"
      />
      <Section
        icon={<CircleHelp className="h-4 w-4" />}
        title="이해 검증 질문"
        items={feedback.verificationQuestions}
        tone="border-indigo-200 bg-indigo-50 text-indigo-800"
      />
      <Section
        icon={<MapPinned className="h-4 w-4" />}
        title="다음 복습 단서"
        items={feedback.nextReviewHints}
        tone="border-teal-200 bg-teal-50 text-teal-800"
      />
    </div>
  );
}
