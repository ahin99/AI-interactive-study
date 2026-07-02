"use client";

import { use } from "react";
import Link from "next/link";
import { getSubjectById } from "@/lib/mock-data";
import { MetricCard } from "@/components/metric-card";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{subject.name}</h1>
        <p className="mt-1 text-sm text-slate-500">주차 타일을 눌러 개념 지도를 확대하세요.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="지도 완성률" value={`${subject.completionRate}%`} accent="text-teal-700" />
        <MetricCard
          label="메타인지 오차율"
          value={`${subject.metacognitionGapRate}%`}
          accent="text-pink-600"
        />
        <MetricCard label="업로드 자료" value={`${subject.materialCount}개`} accent="text-slate-700" />
      </div>

      <SubjectMapView subject={subject} />
    </div>
  );
}
