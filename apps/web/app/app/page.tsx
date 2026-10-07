import Link from "next/link";
import { copy } from "@maicro/core/copy";
import { ENGINE_LABEL } from "@maicro/core/types";
import type { Channel, Finding } from "@maicro/core/types";
import { Chip, type FindingTone } from "@/components/FindingCard";
import { statusTone } from "@/components/report";
import { requireOwner } from "@/lib/owner";
import { loadDashboard } from "@/lib/reads";
import { dateShort, hostOf, addDays } from "@/lib/format";
import { questionFor, wrongText, correctText } from "@/lib/questions";
import { checkNow } from "./actions";
import { getScanReport } from "@/lib/core";

const channelTone: Record<Channel["status"], FindingTone> = { pending: "neutral", synced: "ok", mismatch: "doubt", failed: "wrong", manual: "neutral" };

const recheckDays: Record<Finding["sourceType"], number> = { owned_facts_page: 7, owned_website: 14, directory_api: 7, directory_form: 14, third_party: 30, other_entity: 30, none: 0 };

function nextStep(f: Finding): string {
  if (f.status === "resolved") return "";
  if (f.verdict === "not_found") return [copy.fixPathNotFound, f.status === "unfixable" ? "" : `Hercontrole ${dateShort(addDays(f.firstSeenAt, 21))}`].filter(Boolean).join(" ");
  if (f.status === "unfixable") return copy.fixPath.none;
  const days = recheckDays[f.sourceType];
  const when = days ? `Hercontrole ${dateShort(addDays(f.firstSeenAt, days))}` : "";
  return [copy.fixPath[f.sourceType].split(". Hercontrole")[0], when].filter(Boolean).join(". ");
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ controle?: string }> }) {
  const sp = await searchParams;
  const { business } = await requireOwner();
  const data = await loadDashboard(business.id);
  const d = copy.dashboard;

  const lastRun = data.scanRuns.find((r) => r.status === "done");
  const openFindings = data.findings.filter((f) => f.status !== "resolved");
  const resolved = data.findings.filter((f) => f.status === "resolved");
  const report = lastRun ? await getScanReport(lastRun.id) : null;

  const setup = [
    { key: "facts", label: d.setupSteps.facts, done: Boolean(data.facts && !data.facts.provisional), href: "/app/gegevens" },
    { key: "domain", label: d.setupSteps.domain, done: Boolean(business.factsHostVerifiedAt), href: "/app/domein" },
    { key: "google", label: d.setupSteps.google, done: data.channels.some((c) => c.type === "gbp" && c.status !== "pending"), href: "/app/google" },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="h2">{d.h1}</h1>
          <p className="mt-2 text-[17px]">
            {lastRun ? (
              <>
                <strong className="font-semibold">{d.statusLine(report ? report.totalAnswers - report.wrongAnswers - (report.notFoundAnswers ?? 0) : 0, report?.totalAnswers ?? 0)}</strong>
                {report && (report.notFoundAnswers ?? 0) > 0 && <span className="ml-2 text-secondary">{copy.result.notFoundCount(report.notFoundAnswers)}</span>}
                <span className="mono ml-3">{d.lastScan(dateShort(lastRun.finishedAt ?? lastRun.startedAt))}</span>
              </>
            ) : (
              d.noScan
            )}
          </p>
        </div>
        <form action={checkNow}>
          <button type="submit" className="btn-primary">
            {d.checkNow}
          </button>
        </form>
      </header>
      {sp.controle === "ingepland" && <p className="rounded-card border border-rule bg-white px-4 py-3 text-[15px]">{d.checkQueued}</p>}

      {/* Setup checklist */}
      {setup.some((s) => !s.done) && (
        <section>
          <h2 className="font-sans text-[18px] font-semibold tracking-normal">{d.sections.setup}</h2>
          <ol className="card mt-3 divide-y divide-rule">
            {setup.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-4 px-5 py-3">
                <span className="flex items-center gap-3">
                  <span className={`inline-block w-4 text-center font-mono ${s.done ? "text-ok" : "text-secondary"}`} aria-hidden>
                    {s.done ? "✓" : "·"}
                  </span>
                  <span className={s.done ? "text-secondary" : "font-medium"}>{s.label}</span>
                </span>
                <Link href={s.href} className="text-[14px]">
                  {s.done ? d.stepDone : d.stepTodo}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Findings timeline */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-sans text-[18px] font-semibold tracking-normal">{d.sections.findings}</h2>
          {lastRun && (
            <Link href={`/r/${lastRun.id}`} className="text-[14px]">
              {d.viewReport}
            </Link>
          )}
        </div>
        {openFindings.length === 0 ? (
          <p className="mt-3 text-[15px] text-secondary">{d.noFindings}</p>
        ) : (
          <ol className="card mt-3 divide-y divide-rule">
            {openFindings.map((f) => (
              <li key={f.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[120px_1fr] sm:gap-6">
                <div className="flex flex-col gap-1">
                  <Chip tone={statusTone[f.status]}>{copy.findingStatus[f.status]}</Chip>
                  <span className="font-mono text-[12px] text-secondary">{dateShort(f.firstSeenAt)}</span>
                </div>
                <div className="text-[15px]">
                  <p className="italic text-secondary">{questionFor(f.factKey, f.subject, business.name, business.place)}</p>
                  <p className="mt-1">
                    {ENGINE_LABEL[f.engine]}:{" "}
                    {f.verdict === "not_found" ? <span className="text-secondary">{copy.result.card.notFoundAnswer}</span> : <span className="mark-wrong">{wrongText(f)}</span>}{" "}
                    <span className="text-secondary">→</span> {correctText(f)}
                  </p>
                  <p className="mono mt-2">
                    {f.verdict === "not_found" ? (
                      copy.findingVerdict.not_found
                    ) : f.sourceUrl ? (
                      <a href={f.sourceUrl} target="_blank" rel="nofollow noopener">
                        {hostOf(f.sourceUrl)}
                      </a>
                    ) : (
                      copy.sourceType[f.sourceType]
                    )}
                    {" · "}
                    {d.nextStep}: {nextStep(f)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Proof cards */}
      {resolved.length > 0 && (
        <section>
          <h2 className="font-sans text-[18px] font-semibold tracking-normal">{d.sections.proof}</h2>
          <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {resolved.map((f) => (
              <li key={f.id} className="card p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[12px] text-secondary">
                    {ENGINE_LABEL[f.engine]} · {copy.factKey[f.factKey]}
                  </span>
                  <Chip tone="ok">{f.resolvedAt ? `Hersteld ${dateShort(f.resolvedAt)}` : copy.findingStatus.resolved}</Chip>
                </div>
                <p className="mt-3 text-[15px]">
                  <span className="mark-wrong">{wrongText(f)}</span>
                </p>
                <p className="mt-2 text-[15px]">
                  <Chip tone="ok">{correctText(f)}</Chip>
                </p>
                <p className="mono mt-3">
                  {f.sourceUrl ? hostOf(f.sourceUrl) : copy.sourceType[f.sourceType]} · {dateShort(f.firstSeenAt)}
                  {f.resolvedAt ? ` → ${dateShort(f.resolvedAt)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Channels */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-sans text-[18px] font-semibold tracking-normal">{d.sections.channels}</h2>
          <Link href={`/feiten/${business.slug}`} className="text-[14px]">
            {d.factsPage}
          </Link>
        </div>
        {data.channels.length === 0 ? (
          <p className="mt-3 text-[15px] text-secondary">{d.noChannels}</p>
        ) : (
          <ul className="card mt-3 divide-y divide-rule">
            {data.channels.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-3 text-[15px]">
                <span>
                  {c.name}
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noopener" className="ml-2 font-mono text-[12px]">
                      {hostOf(c.url)}
                    </a>
                  )}
                </span>
                <span className="flex items-center gap-3">
                  {c.lastSyncedAt && <span className="hidden font-mono text-[12px] text-secondary sm:inline">{dateShort(c.lastSyncedAt)}</span>}
                  <Chip tone={channelTone[c.status]}>{copy.channelStatus[c.status]}</Chip>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Billing */}
      <section className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-sans text-[18px] font-semibold tracking-normal">{d.invoices}</h2>
          <p className="mt-1 text-[15px] text-secondary">{d.invoicesBody}</p>
        </div>
        <form action="/api/billing/portal" method="post">
          <button type="submit" className="btn-small">
            {d.openPortal}
          </button>
        </form>
      </section>
    </div>
  );
}
