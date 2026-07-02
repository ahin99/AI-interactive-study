"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemoStore } from "@/lib/demo-store";
import { getWeekById, getWeekConcepts, getWeekMaterials, mockWeekSampleAnswer } from "@/lib/mock-data";
import { RecallFlowSteps } from "@/components/recall-flow-steps";
import { RecallDifficultySelector } from "@/components/recall-difficulty-selector";
import { WeekSelfAssessment } from "@/components/week-self-assessment";
import type { AiApiResponse } from "@/lib/ai/schemas";
import type { WeekFeedbackResult } from "@/lib/types";

export default function WeekRecallPage({
  params,
}: {
  params: Promise<{ subjectId: string; weekId: string }>;
}) {
  const { subjectId, weekId } = use(params);
  const router = useRouter();
  const [step, setStep] = useState<"check" | "recall">("check");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const storeWeeks = useDemoStore((s) => s.weeks);
  const aiConceptsByWeekId = useDemoStore((s) => s.aiWeekConceptsByWeekId);
  const aiMaterialsByWeekId = useDemoStore((s) => s.aiMaterialsByWeekId);
  const week = storeWeeks.find((w) => w.id === weekId) ?? getWeekById(weekId);
  const concepts = [...getWeekConcepts(weekId), ...(aiConceptsByWeekId[weekId] ?? [])];
  const materials = [...getWeekMaterials(weekId), ...(aiMaterialsByWeekId[weekId] ?? [])];

  const selectWeek = useDemoStore((s) => s.selectWeek);
  const weekRecallAnswer = useDemoStore((s) => s.weekRecallAnswer);
  const setWeekRecallAnswer = useDemoStore((s) => s.setWeekRecallAnswer);
  const submitWeekRecall = useDemoStore((s) => s.submitWeekRecall);
  const setCurrentWeekFeedback = useDemoStore((s) => s.setCurrentWeekFeedback);
  const weekSelfAssessments = useDemoStore((s) => s.weekSelfAssessments);
  const recallDifficulty = useDemoStore((s) => s.recallDifficulty);
  const recallRecords = useDemoStore((s) => s.recallRecords);
  const feedbackById = useDemoStore((s) => s.feedbackById);

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

  async function handleSubmit() {
    if (!weekRecallAnswer.trim()) return;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const previousRecords = recallRecords
        .filter((record) => record.weekId === weekId)
        .slice(-3)
        .map((record) => ({
          submittedAt: record.submittedAt,
          nextReviewHint: feedbackById[record.feedbackId]?.nextReviewHint ?? "",
        }));

      const response = await fetch("/api/ai/grade-recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          weekId,
          subjectName: subjectId,
          weekTitle: week?.title,
          concepts,
          selfAssessments: weekSelfAssessments[weekId] ?? [],
          difficulty: recallDifficulty,
          answerText: weekRecallAnswer,
          previousRecords,
        }),
      });
      const payload = (await response.json()) as AiApiResponse<WeekFeedbackResult>;
      if (!payload.ok) throw new Error(payload.message);
      setCurrentWeekFeedback(payload.data);
    } catch (error) {
      submitWeekRecall(weekId);
      setErrorMessage(
        error instanceof Error
          ? `AI 피드백 호출에 실패해 mock 피드백을 사용했습니다. (${error.message})`
          : "AI 피드백 호출에 실패해 mock 피드백을 사용했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
    router.push(`/subjects/${subjectId}/weeks/${weekId}/feedback`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium text-teal-700">{week.title}</p>
        <h1 className="text-xl font-semibold text-slate-900">백지복습</h1>
        <p className="mt-1 text-sm text-slate-500">
          업로드 파일 {materials.length}개 · 자료를 보지 않고 직접 설명해 보세요.
        </p>
      </div>

      <RecallFlowSteps current={step === "check" ? 1 : 2} />

      {step === "check" ? (
        <div className="space-y-4">
          <WeekSelfAssessment weekId={weekId} concepts={concepts} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep("recall")}
              className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              다음: 백지 복습
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
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
              rows={12}
              placeholder="자료를 보지 않고 이번 주차 개념을 직접 설명해 보세요."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("check")}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400"
            >
              이전: 개념 체크
            </button>
            <button
              type="button"
              disabled={!weekRecallAnswer.trim() || isSubmitting}
              onClick={handleSubmit}
              className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "AI 피드백 생성 중..." : "제출하고 피드백 보기"}
            </button>
          </div>
          {errorMessage && <p className="text-xs text-orange-600">{errorMessage}</p>}
        </div>
      )}
    </div>
  );
}
