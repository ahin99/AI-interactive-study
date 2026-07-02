"use client";

import Link from "next/link";
import { BookOpenCheck, Plus } from "lucide-react";
import { mockSubjects } from "@/lib/mock-data";
import { SubjectCard } from "@/components/subject-card";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="min-h-[32vh] rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10">
        <div className="flex h-full flex-col justify-center gap-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <BookOpenCheck className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm font-medium text-teal-700">자기주도 법학 백지복습 AI</p>
              <h1 className="text-3xl font-bold text-slate-950 sm:text-5xl">Lexirecall</h1>
            </div>
          </div>
          <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            AI가 정답을 바로 알려주기보다, 학생이 안다고 착각한 개념과 실제 설명 가능한 개념의 차이를 드러냅니다.
            과목별 개념 지도를 보며 백지복습 기록을 누적하고 다음 복습 단서를 확인하세요.
          </p>
        </div>
      </section>

      {mockSubjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">아직 등록된 과목이 없습니다.</p>
        </div>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">전체 과목</h2>
            <Link
              href="/upload"
              className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              과목 추가
            </Link>
          </div>
          <div className="-mx-4 overflow-x-auto px-4 pb-3">
            <div className="flex gap-4">
              {mockSubjects.map((s) => (
                <div key={s.id} className="w-[280px] shrink-0 sm:w-[320px]">
                  <SubjectCard subject={s} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
