"use client";

import { useRouter } from "next/navigation";
import { useDemoStore } from "@/lib/demo-store";
import { getWeekMaterials } from "@/lib/mock-data";
import type { StudyWeek } from "@/lib/types";
import { RecallHistoryPanel } from "./recall-history-panel";

export function WeekDetailPanel({ week }: { week: StudyWeek }) {
  const router = useRouter();
  const recallRecords = useDemoStore((s) => s.recallRecords);
  const feedbackById = useDemoStore((s) => s.feedbackById);
  const aiMaterialsByWeekId = useDemoStore((s) => s.aiMaterialsByWeekId);
  const weekRecords = recallRecords.filter((r) => r.weekId === week.id);
  const materials = [...getWeekMaterials(week.id), ...(aiMaterialsByWeekId[week.id] ?? [])];

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{week.title}</h3>
          <p className="text-xs text-slate-400">백지복습 {week.reviewCount}회 진행</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/subjects/${week.subjectId}/weeks/${week.id}/recall`)}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          백지복습 하기
        </button>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-slate-500">업로드 파일 ({materials.length}개)</p>
        <ul className="space-y-1 text-sm text-slate-600">
          {materials.map((m) => (
            <li key={m.id} className="truncate">
              {m.displayName}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => router.push(`/upload?subjectId=${week.subjectId}&weekId=${week.id}`)}
          className="mt-2 text-xs font-medium text-teal-700 hover:underline"
        >
          지식 지도 확장하기 (자료 추가) →
        </button>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-slate-500">이전 백지복습 기록</p>
        <RecallHistoryPanel records={weekRecords} feedbackById={feedbackById} />
      </div>
    </div>
  );
}
