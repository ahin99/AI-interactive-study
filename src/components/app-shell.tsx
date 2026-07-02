import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import { Breadcrumbs } from "./progress-steps";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-900">
            <BookOpenCheck className="h-6 w-6 text-teal-700" />
            <span className="text-lg font-semibold">LexiRecall</span>
          </Link>
          <Breadcrumbs />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        LexiRecall — 자기주도 법학 백지복습 AI
      </footer>
    </div>
  );
}
