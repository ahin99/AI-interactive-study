"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, FileText } from "lucide-react";
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
      className="flex h-full w-full flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5 text-left transition-colors hover:border-slate-400 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-2xl font-bold tracking-normal text-slate-950">{subject.name}</h3>
        <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-300" />
      </div>

      <div className="grid grid-cols-2 gap-2 border-y border-slate-100 py-3">
        <div>
          <p className="text-xs text-slate-500">개념 지도 완성률</p>
          <p className="mt-0.5 text-lg font-semibold text-slate-900">{subject.completionRate}%</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">메타인지 오차율</p>
          <p className="mt-0.5 text-lg font-semibold text-pink-600">{subject.metacognitionGapRate}%</p>
        </div>
      </div>

      <div className="min-h-[72px] space-y-1 text-sm">
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
