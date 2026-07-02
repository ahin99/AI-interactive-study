"use client";

import { use } from "react";
import Link from "next/link";
import { getSubjectById } from "@/lib/mock-data";
import { SubjectMapView } from "@/components/subject-map-view";

export default function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = use(params);
  const subject = getSubjectById(subjectId);

  if (!subject) {
    return (
      <div className="max-w-md space-y-3">
        <p className="text-sm text-slate-500">과목을 찾을 수 없습니다.</p>
        <Link href="/" className="text-sm font-medium text-teal-700 hover:underline">
          홈으로 돌아가기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-4xl font-bold tracking-normal text-slate-950 sm:text-6xl">{subject.name}</h1>
        <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 border-y border-slate-200 bg-white px-5 py-4 text-base text-slate-600">
          <span>
            지도 완성률 <strong className="ml-1 text-slate-950">{subject.completionRate}%</strong>
          </span>
          <span>
            메타인지 오차율 <strong className="ml-1 text-pink-600">{subject.metacognitionGapRate}%</strong>
          </span>
          <span>
            업로드 자료 <strong className="ml-1 text-slate-950">{subject.materialCount}개</strong>
          </span>
        </div>
      </div>

      <SubjectMapView subject={subject} />
    </div>
  );
}
