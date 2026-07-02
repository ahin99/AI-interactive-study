"use client";

import { useDemoStore } from "@/lib/demo-store";
import type { VerificationQuestion } from "@/lib/types";

const typeLabel: Record<VerificationQuestion["type"], string> = {
  reason: "이유",
  boundary: "경계",
  comparison: "비교",
  application: "적용",
  premise: "전제",
};

export function VerificationQuestionList({ questions }: { questions: VerificationQuestion[] }) {
  const answers = useDemoStore((s) => s.verificationAnswers);
  const setAnswer = useDemoStore((s) => s.setVerificationAnswer);

  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <p className="mb-2 text-sm font-medium text-indigo-900">
            <span className="mr-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
              {typeLabel[q.type]} 질문 {i + 1}
            </span>
            {q.question}
          </p>
          <textarea
            value={answers[q.id] ?? ""}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            rows={2}
            placeholder="생각을 정리해 답변해 보세요."
            className="w-full rounded-md border border-indigo-200 bg-white p-2 text-sm"
          />
        </div>
      ))}
    </div>
  );
}
