"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { copyFor, type CopyShape, type Lang } from "@maicro/core/copy";
import { ENGINE_LABEL, type Engine } from "@maicro/core/types";
import { localizeHref } from "@/lib/lang-paths";
import type { ScanProgressStep } from "@/lib/core";

type Status = "queued" | "running" | "done" | "failed";

/** The step's label in this page's language (the stored label is in the language the scan was started in). */
function stepLabel(s: ScanProgressStep, steps: CopyShape["scan"]["steps"]): string {
  if (s.key.startsWith("ask:")) {
    const engine = s.key.slice(4) as Engine;
    return engine in ENGINE_LABEL ? steps.asking(ENGINE_LABEL[engine]) : s.label;
  }
  const fixed: Record<string, string> = { found: steps.found, comparing: steps.comparing, sources: steps.sources, done: steps.done };
  return fixed[s.key] ?? s.label;
}

export function ScanProgress({ scanRunId, initialSteps, initialStatus, lang }: { scanRunId: string; initialSteps: ScanProgressStep[]; initialStatus: Status; lang: Lang }) {
  const copy = copyFor(lang);
  const [steps, setSteps] = useState(initialSteps);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "done" || status === "failed") return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/scan/${scanRunId}/status`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { status: Status; steps: ScanProgressStep[]; reportUrl: string | null };
        if (cancelled) return;
        setSteps(data.steps);
        setStatus(data.status);
        if (data.reportUrl) setReportUrl(data.reportUrl);
        if (data.status === "done" && data.reportUrl) router.replace(localizeHref(data.reportUrl, lang));
      } catch {
        /* retry on next tick */
      }
    };
    void tick();
    const t = setInterval(tick, 2000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [scanRunId, status, router, lang]);

  const firstOpen = steps.findIndex((s) => !s.done);

  return (
    <div className="mt-8">
      <ol className="card divide-y-[1px] divide-line text-[15px]" aria-live="polite">
        {steps.map((s, i) => {
          const active = i === firstOpen && status !== "failed";
          return (
            <li key={s.key} className={`flex items-center gap-3 px-5 py-3.5 ${s.done ? "text-ink" : active ? "font-semibold text-ink" : "text-muted"}`}>
              <span aria-hidden className={`inline-block h-3 w-3 shrink-0 rounded-full ${s.done ? "bg-groen" : active ? "bg-oranje" : "bg-line"}`} />
              <span>{stepLabel(s, copy.scan.steps)}</span>
            </li>
          );
        })}
      </ol>
      {status === "failed" ? (
        <p className="mt-4 text-[15px]">
          {copy.scan.failed}{" "}
          <Link href={localizeHref("/#top", lang)} className="btn-link">{copy.scan.retry}</Link>
        </p>
      ) : status === "done" ? (
        <p className="mt-4 text-[15px]">
          <Link href={localizeHref(reportUrl ?? `/scan/${scanRunId}`, lang)} className="btn-link">{copy.scan.toReport}</Link>
        </p>
      ) : (
        <p className="mt-4 text-[14px] text-muted">{copy.scan.waiting}</p>
      )}
    </div>
  );
}
