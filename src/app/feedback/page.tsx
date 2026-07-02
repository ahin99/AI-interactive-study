"use client";

import Link from "next/link";
import { MessageSquareText } from "lucide-react";

export default function FeedbackCompatPage() {
  return (
    <div className="max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-center">
      <MessageSquareText className="mx-auto h-8 w-8 text-slate-300" />
      <h1 className="text-lg font-semibold text-slate-900">피드백 화면이 이동했습니다</h1>
      <p className="text-sm text-slate-500">
        첨삭형 피드백과 이해 검증 질문은 이제 주차별 피드백 화면에서 제공됩니다.
      </p>
      <Link
        href="/subjects/civil-law-general/weeks/week-4/feedback"
        className="inline-block rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        4주차 피드백 보러 가기 →
      </Link>
    </div>
  );
}
