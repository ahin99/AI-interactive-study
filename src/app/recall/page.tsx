"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";

export default function RecallCompatPage() {
  return (
    <div className="max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-center">
      <PenLine className="mx-auto h-8 w-8 text-slate-300" />
      <h1 className="text-lg font-semibold text-slate-900">백지복습 화면이 이동했습니다</h1>
      <p className="text-sm text-slate-500">
        백지복습은 이제 주차 단위로 진행됩니다. 과목 상세에서 주차를 선택한 뒤 시작하세요.
      </p>
      <Link
        href="/subjects/civil-law-general/weeks/week-4/recall"
        className="inline-block rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        4주차 백지복습 하러 가기 →
      </Link>
    </div>
  );
}
