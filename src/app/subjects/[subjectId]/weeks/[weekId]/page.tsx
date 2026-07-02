"use client";

import { use, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenLine } from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import { getSubjectById, getWeekById, getWeekConcepts } from "@/lib/mock-data";
import { WeekExpandedMap } from "@/components/week-expanded-map";
import { RecallHistoryPanel } from "@/components/recall-history-panel";

export default function WeekDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string; weekId: string }>;
}) {
  const { subjectId, weekId } = use(params);
  const router = useRouter();
  const subject = getSubjectById(subjectId);

  const selectedMapMode = useDemoStore((s) => s.selectedMapMode);
  const selectWeek = useDemoStore((s) => s.selectWeek);
  const mapSnapshots = useDemoStore((s) => s.mapSnapshots);
  const recallRecords = useDemoStore((s) => s.recallRecords);
  const feedbackById = useDemoStore((s) => s.feedbackById);
  const storeWeeks = useDemoStore((s) => s.weeks);
  const aiConceptsByWeekId = useDemoStore((s) => s.aiWeekConceptsByWeekId);
  const week = storeWeeks.find((w) => w.id === weekId) ?? getWeekById(weekId);
  const concepts = [...getWeekConcepts(weekId), ...(aiConceptsByWeekId[weekId] ?? [])];

  useEffect(() => {
    selectWeek(weekId);
  }, [selectWeek, weekId]);

  const activeSnapshot = useMemo(
    () => mapSnapshots.filter((snapshot) => snapshot.subjectId === subjectId).at(-1),
    [mapSnapshots, subjectId]
  );
  const weekRecords = recallRecords.filter((record) => record.weekId === weekId);

  if (!subject || !week) {
    return (
      <div className="max-w-md space-y-3">
        <p className="text-sm text-slate-500">주차를 찾을 수 없습니다.</p>
        <Link href={`/subjects/${subjectId}`} className="text-sm font-medium text-teal-700 hover:underline">
          과목 상세로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-teal-700">{subject.name}</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950 sm:text-5xl">{week.title}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <WeekExpandedMap concepts={concepts} snapshot={activeSnapshot} mode={selectedMapMode} />
          <button
            type="button"
            onClick={() => router.push(`/subjects/${subjectId}/weeks/${weekId}/recall`)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <PenLine className="h-4 w-4" />
            백지복습 하기
          </button>
        </section>

        <aside className="max-h-[calc(100vh-220px)] overflow-y-auto rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">이전 백지복습 기록</h2>
          <RecallHistoryPanel records={weekRecords} feedbackById={feedbackById} />
        </aside>
      </div>
    </div>
  );
}
