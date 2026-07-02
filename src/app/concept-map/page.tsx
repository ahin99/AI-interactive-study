"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

export default function ConceptMapCompatPage() {
  return (
    <div className="max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-center">
      <Compass className="mx-auto h-8 w-8 text-slate-300" />
      <h1 className="text-lg font-semibold text-slate-900">개념 지도 화면이 이동했습니다</h1>
      <p className="text-sm text-slate-500">
        개념 지도와 사전 자기평가는 이제 과목 상세 화면에서 주차 단위로 제공됩니다.
      </p>
      <Link
        href="/subjects/civil-law-general"
        className="inline-block rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        민법총칙 과목 상세로 이동 →
      </Link>
    </div>
  );
}
