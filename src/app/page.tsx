"use client";

import { Plus } from "lucide-react";
import { mockSubjects } from "@/lib/mock-data";
import { SubjectCard } from "@/components/subject-card";

export default function Home() {
  const recentSubjects = mockSubjects.filter((s) => s.recent);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">내 과목</h1>
          <p className="mt-1 text-sm text-slate-500">
            과목을 선택해 지식 지도를 보고 백지복습을 시작하세요.
          </p>
        </div>
        <button
          type="button"
          disabled
          title="현재 시연 단계에서는 새 과목 추가가 비활성화되어 있습니다."
          className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400"
        >
          <Plus className="h-4 w-4" />
          과목 추가
        </button>
      </div>

      {mockSubjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">아직 등록된 과목이 없습니다.</p>
        </div>
      ) : (
        <>
          {recentSubjects.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-500">최근 복습한 과목</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentSubjects.map((s) => (
                  <SubjectCard key={s.id} subject={s} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-500">전체 과목</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockSubjects.map((s) => (
                <SubjectCard key={s.id} subject={s} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
