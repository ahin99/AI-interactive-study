"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, FileUp, Loader2, X } from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import { getWeekById, mockWeekMaterials } from "@/lib/mock-data";
import type { AiApiResponse, AnalyzeMaterialAIResult } from "@/lib/ai/schemas";

type Status = "idle" | "analyzing" | "analyzed";

interface DraftFile {
  id: string;
  fileName: string;
  displayName: string;
  file?: File;
  mimeType?: string;
}

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function UploadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId") ?? "civil-law-general";
  const presetWeekId = searchParams.get("weekId");
  const presetWeek = presetWeekId ? getWeekById(presetWeekId) : undefined;

  const [course, setCourse] = useState("민법총칙");
  const [weekNumber, setWeekNumber] = useState(presetWeek ? String(presetWeek.weekNumber) : "6");
  const [files, setFiles] = useState<DraftFile[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [analyzedWeekId, setAnalyzedWeekId] = useState<string | null>(null);
  const saveMaterialAnalysis = useDemoStore((s) => s.saveMaterialAnalysis);

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const added = Array.from(fileList).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fileName: f.name,
      displayName: f.name.replace(/\.[^.]+$/, ""),
      file: f,
      mimeType: f.type || "application/octet-stream",
    }));
    setFiles((prev) => [...prev, ...added]);
    setStatus("idle");
  }

  function applySample(material: (typeof mockWeekMaterials)[number]) {
    setFiles((prev) => [
      ...prev,
      {
        id: `${material.id}-${Date.now()}`,
        fileName: material.fileName,
        displayName: material.displayName,
        mimeType: "text/plain",
      },
    ]);
    setStatus("idle");
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function updateDisplayName(id: string, name: string) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, displayName: name } : f)));
  }

  async function startAnalysis() {
    if (files.length === 0) return;
    setStatus("analyzing");
    setMessage("");
    const week = Number(weekNumber);
    if (!Number.isInteger(week) || week < 1 || week > 16) {
      setStatus("idle");
      setMessage("주차는 1부터 16 사이의 숫자로 입력하세요.");
      return;
    }

    try {
      const primary = files[0];
      let fileBase64: string | undefined;
      let plainText: string | undefined;
      const mimeType = primary.mimeType ?? "text/plain";

      if (primary.file && mimeType === "application/pdf") {
        fileBase64 = await readFileAsBase64(primary.file);
      } else if (primary.file && mimeType.startsWith("text/")) {
        plainText = await primary.file.text();
      } else {
        plainText = files
          .map((file) => `파일명: ${file.fileName}\n표시명: ${file.displayName}`)
          .join("\n\n");
      }

      const response = await fetch("/api/ai/analyze-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          subjectName: course,
          weekNumber: week,
          fileName: primary.fileName,
          mimeType,
          fileBase64,
          plainText,
        }),
      });
      const payload = (await response.json()) as AiApiResponse<AnalyzeMaterialAIResult>;
      if (!payload.ok) throw new Error(payload.message);
      const weekId = saveMaterialAnalysis({
        subjectId,
        fileName: primary.fileName,
        mimeType,
        analysis: payload.data,
      });
      setAnalyzedWeekId(weekId);
      setStatus("analyzed");
      setMessage(payload.fallback ? payload.message ?? "임시 개념 구조로 저장했습니다." : "");
    } catch (error) {
      setStatus("idle");
      setMessage(error instanceof Error ? error.message : "자료 분석에 실패했습니다.");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">자료 업로드</h1>
        <p className="mt-1 text-sm text-slate-500">
          한 주차에 여러 파일을 업로드할 수 있습니다. 업로드한 파일은 하나의 주차 개념 지도로
          통합됩니다.
        </p>
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-500">과목명</label>
          <input
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">주차</label>
          <input
            value={weekNumber}
            onChange={(e) => setWeekNumber(e.target.value)}
            type="number"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      <label
        htmlFor="file-input"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center hover:border-teal-400"
      >
        <FileUp className="h-8 w-8 text-slate-400" />
        <p className="text-sm text-slate-600">
          파일을 드래그하거나 클릭해서 선택하세요 (PDF, PPT) · 여러 개 선택 가능
        </p>
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </label>

      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span>샘플 자료 사용:</span>
        {mockWeekMaterials.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => applySample(m)}
            className="rounded-full border border-slate-300 px-3 py-1 hover:border-teal-400 hover:text-teal-700"
          >
            {m.displayName}
          </button>
        ))}
      </div>

      {files.length > 0 && (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">
            이번 주차에 업로드할 파일 ({files.length}개)
          </p>
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              <input
                value={f.displayName}
                onChange={(e) => updateDisplayName(f.id, e.target.value)}
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              />
              <span className="hidden shrink-0 truncate text-xs text-slate-400 sm:inline">
                {f.fileName}
              </span>
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="shrink-0 text-slate-400 hover:text-red-500"
                aria-label="파일 제거"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={files.length === 0 || status === "analyzing"}
          onClick={startAnalysis}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {status === "analyzing" && <Loader2 className="h-4 w-4 animate-spin" />}
          분석 시작
        </button>

        {status === "analyzing" && (
          <span className="text-sm text-slate-500">
            AI가 {weekNumber}주차 개념 구조를 통합 추출하는 중...
          </span>
        )}
        {status === "analyzed" && (
          <span className="flex items-center gap-1.5 text-sm text-teal-700">
            <CheckCircle2 className="h-4 w-4" />
            분석 완료
          </span>
        )}
      </div>
      {message && <p className="text-sm text-orange-600">{message}</p>}

      {status === "analyzed" && (
        <button
          type="button"
          onClick={() => router.push(analyzedWeekId ? `/subjects/${subjectId}/weeks/${analyzedWeekId}` : `/subjects/${subjectId}`)}
          className="rounded-full border border-teal-600 px-5 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50"
        >
          과목 상세에서 지식 지도 보기 →
        </button>
      )}
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={null}>
      <UploadForm />
    </Suspense>
  );
}
