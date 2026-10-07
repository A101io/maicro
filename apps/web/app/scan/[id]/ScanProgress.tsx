"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { copy } from "@maicro/core/copy";
import type { ScanProgressStep } from "@/lib/core";

type Status = "queued" | "running" | "done" | "failed";

export function ScanProgress({ scanRunId, initialSteps, initialStatus }: { scanRunId: string; initialSteps: ScanProgressStep[]; initialStatus: Status }) {
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
        if (data.status === "done" && data.reportUrl) router.replace(data.reportUrl);
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
  }, [scanRunId, status, router]);

  const firstOpen = steps.findIndex((s) => !s.done);

  return (
    <div className="mt-8">
      <ol className="card divide-y divide-rule font-mono text-[14px]" aria-live="polite">
        {steps.map((s, i) => {
          const active = i === firstOpen && status !== "failed";
          return (
            <li key={s.key} className={`flex items-center gap-3 px-5 py-3 ${s.done ? "text-ink" : active ? "text-ink" : "text-secondary"}`}>
              <span className="inline-block w-4 text-center" aria-hidden>
                {s.done ? "✓" : active ? "…" : "·"}
              </span>
              <span>{s.label}</span>
            </li>
          );
        })}
      </ol>
      {status === "failed" ? (
        <p className="mt-4 text-[15px]">
          {copy.scan.failed}{" "}
          <Link href="/#controle">{copy.scan.retry}</Link>
        </p>
      ) : status === "done" ? (
        <p className="mt-4 text-[15px]">
          <Link href={reportUrl ?? `/scan/${scanRunId}`}>{copy.scan.toReport}</Link>
        </p>
      ) : (
        <p className="mono mt-4">{copy.scan.waiting}</p>
      )}
    </div>
  );
}
