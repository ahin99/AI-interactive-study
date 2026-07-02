"use client";

import { useState } from "react";
import type { RecallRecord, WeekFeedbackResult } from "@/lib/types";

const difficultyLabel: Record<string, string> = {
  outline: "목차 전체",
  keywords: "핵심 키워드 3개",
  blank: "완전 백지",
};

export function RecallHistoryPanel({
  records,
  feedbackById,
}: {
  records: RecallRecord[];
  feedbackById: Record<string, WeekFeedbackResult>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (records.length === 0) {
    return <p className="text-sm text-slate-400">아직 이 주차의 백지복습 기록이 없습니다.</p>;
  }

  return (
    <div className="space-y-2">
      {records.map((record, i) => {
        const feedback = feedbackById[record.feedbackId];
        const isOpen = openId === record.id;
        return (
          <div key={record.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <span className="font-medium text-slate-900">{i + 1}회차</span>
                <span className="ml-2 text-slate-400">{record.submittedAt}</span>
                <span className="ml-2 text-slate-500">{difficultyLabel[record.difficulty]}</span>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : record.id)}
                className="text-xs font-medium text-teal-700 hover:underline"
              >
                {isOpen ? "접기" : "답안·피드백 보기"}
              </button>
            </div>
            {feedback && (
              <p className="mt-1 text-xs text-slate-500">다음 복습 단서: {feedback.nextReviewHint}</p>
            )}
            {isOpen && (
              <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm">
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">제출한 답안</p>
                  <p className="whitespace-pre-line rounded-md bg-slate-50 p-2 text-slate-700">
                    {record.answerText}
                  </p>
                </div>
                {feedback && feedback.missingHints.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-500">누락 단서</p>
                    <ul className="list-disc space-y-0.5 pl-5 text-red-700">
                      {feedback.missingHints.map((hint, idx) => (
                        <li key={idx}>{hint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
