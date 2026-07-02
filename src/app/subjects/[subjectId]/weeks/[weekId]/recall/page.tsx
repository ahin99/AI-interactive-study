"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemoStore } from "@/lib/demo-store";
import { getWeekById, getWeekConcepts, getWeekMaterials, mockWeekSampleAnswer } from "@/lib/mock-data";
import { RecallDifficultySelector } from "@/components/recall-difficulty-selector";
import { WeekSelfAssessment } from "@/components/week-self-assessment";

export default function WeekRecallPage({
  params,
}: {
  params: Promise<{ subjectId: string; weekId: string }>;
}) {
  const { subjectId, weekId } = use(params);
  const router = useRouter();
  const week = getWeekById(weekId);
  const concepts = getWeekConcepts(weekId);
  const materials = getWeekMaterials(weekId);

  const selectWeek = useDemoStore((s) => s.selectWeek);
  const weekRecallAnswer = useDemoStore((s) => s.weekRecallAnswer);
  const setWeekRecallAnswer = useDemoStore((s) => s.setWeekRecallAnswer);
  const submitWeekRecall = useDemoStore((s) => s.submitWeekRecall);

  useEffect(() => {
    selectWeek(weekId);
  }, [selectWeek, weekId]);

  if (!week) {
    return (
      <div className="max-w-md space-y-3">
        <p className="text-sm text-slate-500">해당 주차를 찾을 수 없습니다.</p>
        <Link href={`/subjects/${subjectId}`} className="text-sm font-medium text-teal-700 hover:underline">
          과목 상세로 돌아가기 →
        </Link>
      </div>
    );
  }

  if (concepts.length === 0) {
    return (
      <div className="max-w-md space-y-3">
        <p className="text-sm text-slate-500">이 주차에는 아직 개념이 없습니다.</p>
        <Link href={`/subjects/${subjectId}`} className="text-sm font-medium text-teal-700 hover:underline">
          과목 상세로 돌아가기 →
        </Link>
      </div>
    );
  }

  function handleSubmit() {
    if (!weekRecallAnswer.trim()) return;
    submitWeekRecall(weekId);
    router.push(`/subjects/${subjectId}/weeks/${weekId}/feedback`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-medium text-teal-700">{week.title}</p>
        <h1 className="text-xl font-semibold text-slate-900">백지복습</h1>
        <p className="mt-1 text-sm text-slate-500">
          업로드 파일 {materials.length}개 · 자료를 보지 않고 직접 설명해 보세요.
        </p>
      </div>

      <WeekSelfAssessment weekId={weekId} concepts={concepts} />

      <RecallDifficultySelector weekId={weekId} />

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-medium text-slate-500">백지복습 답안</label>
          <button
            type="button"
            onClick={() => setWeekRecallAnswer(mockWeekSampleAnswer[weekId] ?? "")}
            className="text-xs text-teal-700 hover:underline"
          >
            예시 답안 넣기
          </button>
        </div>
        <textarea
          value={weekRecallAnswer}
          onChange={(e) => setWeekRecallAnswer(e.target.value)}
          rows={10}
          placeholder="자료를 보지 않고 이번 주차 개념을 직접 설명해 보세요."
          className="w-full rounded-lg border border-slate-300 p-3 text-sm"
        />
      </div>

      <button
        type="button"
        disabled={!weekRecallAnswer.trim()}
        onClick={handleSubmit}
        className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        제출
      </button>
    </div>
  );
}
