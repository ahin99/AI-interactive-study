"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPinned } from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import { getWeekById } from "@/lib/mock-data";
import { AnnotatedAnswer } from "@/components/annotated-answer";
import { RecallFlowSteps } from "@/components/recall-flow-steps";
import { VerificationQuestionList } from "@/components/verification-question-list";

export default function WeekFeedbackPage({
  params,
}: {
  params: Promise<{ subjectId: string; weekId: string }>;
}) {
  const { subjectId, weekId } = use(params);
  const router = useRouter();
  const week = getWeekById(weekId);

  const currentWeekFeedback = useDemoStore((s) => s.currentWeekFeedback);
  const verificationAnswers = useDemoStore((s) => s.verificationAnswers);
  const saveRecallRecord = useDemoStore((s) => s.saveRecallRecord);
  const resetCurrentRecall = useDemoStore((s) => s.resetCurrentRecall);

  if (!week || !currentWeekFeedback || currentWeekFeedback.weekId !== weekId) {
    return (
      <div className="max-w-md space-y-3">
        <p className="text-sm text-slate-500">아직 제출한 백지복습이 없습니다.</p>
        <Link
          href={`/subjects/${subjectId}/weeks/${weekId}/recall`}
          className="text-sm font-medium text-teal-700 hover:underline"
        >
          백지복습 하러 가기 →
        </Link>
      </div>
    );
  }

  const allAnswered = currentWeekFeedback.verificationQuestions.every(
    (q) => (verificationAnswers[q.id] ?? "").trim().length > 0
  );

  function handleSave() {
    saveRecallRecord();
    resetCurrentRecall();
    router.push(`/subjects/${subjectId}/weeks/${weekId}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-teal-700">{week.title}</p>
        <h1 className="text-xl font-semibold text-slate-900">첨삭형 피드백</h1>
        <p className="mt-1 text-sm text-slate-500">
          정답 해설이 아니라 누락과 혼동만 단서로 알려드립니다. 다음 단계는 직접 찾아보세요.
        </p>
      </div>

      <RecallFlowSteps current={3} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <section className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">내 답안</p>
            <AnnotatedAnswer blocks={currentWeekFeedback.answerBlocks} />
          </div>

          {currentWeekFeedback.missingHints.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="mb-2 text-sm font-semibold text-red-800">누락된 내용 단서</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
                {currentWeekFeedback.missingHints.map((hint, i) => (
                  <li key={i}>{hint}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
            <MapPinned className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">복습 제안</p>
              <p className="mt-1">{currentWeekFeedback.nextReviewHint}</p>
            </div>
          </div>
        </section>

        <aside className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">소크라테스식 이해 검증 질문</p>
            <VerificationQuestionList questions={currentWeekFeedback.verificationQuestions} />
          </div>

          <button
            type="button"
            disabled={!allAnswered}
            onClick={handleSave}
            className="w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            결과 저장
          </button>
          {!allAnswered && (
            <p className="text-xs text-slate-400">질문 3개에 모두 답변하면 저장할 수 있습니다.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
