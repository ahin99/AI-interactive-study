"use client";

const steps = ["개념 체크", "백지 복습", "피드백"] as const;

export function RecallFlowSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="grid grid-cols-3 gap-2">
        {steps.map((label, index) => {
          const step = index + 1;
          const active = step === current;
          const done = step < current;
          return (
            <div
              key={label}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                active
                  ? "bg-slate-950 text-white"
                  : done
                  ? "bg-teal-50 text-teal-800"
                  : "bg-slate-50 text-slate-400"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-slate-900">
                {step}
              </span>
              <span className="truncate font-medium">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
