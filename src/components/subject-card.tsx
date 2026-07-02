"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import type { Subject } from "@/lib/types";

export function SubjectCard({ subject }: { subject: Subject }) {
  const router = useRouter();
  const selectSubject = useDemoStore((s) => s.selectSubject);

  function open() {
    selectSubject(subject.id);
    router.push(`/subjects/${subject.id}`);
  }

  return (
    <button
      type="button"
      onClick={open}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900">{subject.name}</h3>
        {subject.recent && (
          <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
            최근 복습
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-500">개념 지도 완성률</p>
          <p className="mt-0.5 text-2xl font-semibold text-slate-900">{subject.completionRate}%</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">메타인지 오차율</p>
          <p className="mt-0.5 text-2xl font-semibold text-pink-600">{subject.metacognitionGapRate}%</p>
        </div>
      </div>

      <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
        <p className="text-slate-500">
          마지막 복습: <span className="text-slate-700">{subject.lastReviewedAt}</span>
        </p>
        <p className="text-slate-600">{subject.lastReviewHint}</p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <FileText className="h-3.5 w-3.5" />
        업로드된 자료 {subject.materialCount}개
      </div>
    </button>
  );
}
