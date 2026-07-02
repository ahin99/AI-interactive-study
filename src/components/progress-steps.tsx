"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getSubjectById, getWeekById } from "@/lib/mock-data";

const legacyLabel: Record<string, string> = {
  "concept-map": "개념 지도 (구)",
  recall: "백지복습 (구)",
  feedback: "피드백 (구)",
  "knowledge-map": "지식 지도 (구)",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href: string }[] = [{ label: "홈", href: "/" }];

  if (segments[0] === "subjects" && segments[1]) {
    const subject = getSubjectById(segments[1]);
    crumbs.push({ label: subject?.name ?? segments[1], href: `/subjects/${segments[1]}` });

    if (segments[2] === "weeks" && segments[3]) {
      const week = getWeekById(segments[3]);
      crumbs.push({
        label: week?.title ?? segments[3],
        href: `/subjects/${segments[1]}/weeks/${segments[3]}`,
      });
      if (segments[4] === "recall") crumbs.push({ label: "백지복습", href: pathname });
      if (segments[4] === "feedback") crumbs.push({ label: "피드백", href: pathname });
    }
  } else if (segments[0] === "upload") {
    crumbs.push({ label: "업로드", href: "/upload" });
  } else if (segments[0]) {
    crumbs.push({ label: legacyLabel[segments[0]] ?? segments[0], href: `/${segments[0]}` });
  }

  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-slate-900">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-slate-700">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
