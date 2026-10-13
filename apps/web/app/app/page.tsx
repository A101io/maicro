import Link from "next/link";
import type { CopyShape } from "@vidalo/core/copy";
import { getI18n } from "@/lib/i18n";
import { ENGINE_LABEL } from "@vidalo/core/types";
import type { Channel, Finding, FindingStatus, Stip as StipColour } from "@vidalo/core/types";
import { Stip, StipRow } from "@/components/Stip";
import { requireOwner } from "@/lib/owner";
import { loadDashboard } from "@/lib/reads";
import { dateShort, hostOf, addDays } from "@/lib/format";
import { questionFor, wrongText, correctText } from "@/lib/questions";
import { checkNow } from "./actions";
import { getScanReport } from "@/lib/core";

const statusTone: Record<FindingStatus, StipColour> = { open: "rood", fixing: "oranje", recheck: "oranje", resolved: "groen", unfixable: "grijs" };
const channelTone: Record<Channel["status"], StipColour> = { pending: "grijs", synced: "groen", mismatch: "oranje", failed: "rood", manual: "grijs" };

const recheckDays: Record<Finding["sourceType"], number> = { owned_facts_page: 7, owned_website: 14, directory_api: 7, directory_form: 14, third_party: 30, other_entity: 30, none: 0 };

function nextStep(f: Finding, copy: CopyShape): string {
  if (f.status === "resolved") return "";
  if (f.verdict === "not_found") return [copy.fixPathNotFound, f.status === "unfixable" ? "" : `Hercontrole ${dateShort(addDays(f.firstSeenAt, 21))}`].filter(Boolean).join(" ");
  if (f.status === "unfixable") return copy.fixPath.none;
  const days = recheckDays[f.sourceType];
  const when = days ? `Hercontrole ${dateShort(addDays(f.firstSeenAt, days))}` : "";
  return [copy.fixPath[f.sourceType].split(". Hercontrole")[0], when].filter(Boolean).join(". ");
}

function Pill({ tone, children }: { tone: StipColour; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-pill border-[1.5px] border-line px-2.5 py-0.5 text-[13px] font-semibold">
      <Stip tone={tone} /> {children}
    </span>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ controle?: string }> }) {
  const sp = await searchParams;
  const { business } = await requireOwner();
  const data = await loadDashboard(business.id);
  const { copy, href } = await getI18n();
  const d = copy.dashboard;

  const lastRun = data.scanRuns.find((r) => r.status === "done");
  const openFindings = data.findings.filter((f) => f.status !== "resolved");
  const resolved = data.findings.filter((f) => f.status === "resolved");
  const report = lastRun ? await getScanReport(lastRun.id) : null;

  // Google comes first: it is how ownership is proven, and facts and domain wait for it.
  const setup = [
    { key: "google", label: d.setupSteps.google, done: Boolean(business.ownerVerifiedAt), href: "/app/google" },
    { key: "facts", label: d.setupSteps.facts, done: Boolean(data.facts && !data.facts.provisional), href: "/app/gegevens" },
    { key: "domain", label: d.setupSteps.domain, done: Boolean(business.factsHostVerifiedAt), href: "/app/domein" },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          {report && <Stip tone={report.stip} size={22} className="mt-3" />}
          <div>
            <h1 className="h2">{d.h1}</h1>
            <p className="mt-2 text-[17px]">
              {lastRun && report ? (
                <>
                  <span className="font-bold">{d.statusLine(report.totalAnswers - report.wrongAnswers - (report.notFoundAnswers ?? 0), report.totalAnswers)}</span>
                  {(report.notFoundAnswers ?? 0) > 0 && <span className="ml-2 text-muted">{d.notFoundLine(report.notFoundAnswers)}</span>}
                  <span className="ml-3 text-[14px] text-muted">{d.lastScan(dateShort(lastRun.finishedAt ?? lastRun.startedAt))}</span>
                </>
              ) : (
                d.noScan
              )}
            </p>
            {report && <p className="mt-1 text-[15px] text-ink-2">{copy.stipLine[report.stip]}</p>}
          </div>
        </div>
        <form action={checkNow}>
          <button type="submit" className="btn-primary h-[52px]">
            {d.checkNow}
          </button>
        </form>
      </header>
      {sp.controle === "ingepland" && <p className="rounded-xl bg-panel px-4 py-3 text-[15px]">{d.checkQueued}</p>}

      {/* Setup checklist */}
      {setup.some((s) => !s.done) && (
        <section>
          <h2 className="h3">{d.sections.setup}</h2>
          <ol className="card mt-3 divide-y-[1px] divide-line">
            {setup.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <span className="flex items-center gap-3">
                  <Stip tone={s.done ? "groen" : "grijs"} size={12} />
                  <span className={s.done ? "text-muted" : "font-semibold"}>{s.label}</span>
                </span>
                <Link href={href(s.href)} className="btn-link">
                  {s.done ? d.stepDone : d.stepTodo}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Findings */}
      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="h3">{d.sections.findings}</h2>
          {lastRun && (
            <Link href={href(`/r/${lastRun.id}`)} className="btn-link">
              {d.viewReport}
            </Link>
          )}
        </div>
        {openFindings.length === 0 ? (
          <p className="mt-3 text-[15px] text-muted">{d.noFindings}</p>
        ) : (
          <ol className="card mt-3 divide-y-[1px] divide-line">
            {openFindings.map((f) => (
              <li key={f.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                <div className="flex flex-col items-start gap-1">
                  <Pill tone={statusTone[f.status]}>{copy.findingStatus[f.status]}</Pill>
                  <span className="text-[12px] text-muted">{dateShort(f.firstSeenAt)}</span>
                </div>
                <div className="text-[15px]">
                  <p className="italic text-muted">{questionFor(f.factKey, f.subject, business.name, business.place)}</p>
                  <p className="mt-1">
                    {ENGINE_LABEL[f.engine]}:{" "}
                    {f.verdict === "not_found" ? <span className="mark-grey">{copy.result.table.notFound}</span> : <span className="mark-wrong">{f.evidenceKind === "recommendation" ? copy.result.table.notNamed : wrongText(f)}</span>} <span className="text-muted">→</span> {correctText(f)}
                  </p>
                  <p className="mt-2 text-[13px] text-muted">
                    {f.verdict === "not_found" ? (
                      copy.findingVerdict.not_found
                    ) : f.sourceUrl ? (
                      <a href={f.sourceUrl} target="_blank" rel="nofollow noopener" className="underline-offset-2 hover:underline">
                        {hostOf(f.sourceUrl)}
                      </a>
                    ) : (
                      copy.sourceType[f.sourceType]
                    )}
                    {" · "}
                    {d.nextStep}: {nextStep(f, copy)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Proof */}
      {resolved.length > 0 && (
        <section>
          <h2 className="h3">{d.sections.proof}</h2>
          <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {resolved.map((f) => (
              <li key={f.id} className="card flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2 text-[13px] text-muted">
                  <span>
                    {ENGINE_LABEL[f.engine]} · {copy.factKey[f.factKey]}
                  </span>
                  <span>{f.resolvedAt ? `${copy.findingStatus.resolved} ${dateShort(f.resolvedAt)}` : copy.findingStatus.resolved}</span>
                </div>
                <StipRow tone="rood" text={f.verdict === "not_found" ? copy.result.table.notFound : wrongText(f)} />
                <StipRow tone="groen" text={correctText(f)} />
                <p className="text-[13px] text-muted">
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
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="h3">{d.sections.channels}</h2>
          <Link href={href(`/feiten/${business.slug}`)} className="btn-link">
            {d.factsPage}
          </Link>
        </div>
        {data.channels.length === 0 ? (
          <p className="mt-3 text-[15px] text-muted">{d.noChannels}</p>
        ) : (
          <ul className="card mt-3 divide-y-[1px] divide-line">
            {data.channels.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-3.5 text-[15px]">
                <span>
                  {c.name}
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noopener" className="ml-2 text-[13px] text-muted underline-offset-2 hover:underline">
                      {hostOf(c.url)}
                    </a>
                  )}
                </span>
                <span className="flex items-center gap-3">
                  {c.lastSyncedAt && <span className="hidden text-[12px] text-muted sm:inline">{dateShort(c.lastSyncedAt)}</span>}
                  <Pill tone={channelTone[c.status]}>{copy.channelStatus[c.status]}</Pill>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Billing */}
      <section className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="h3">{d.invoices}</h2>
          <p className="mt-1 text-[15px] text-muted">{d.invoicesBody}</p>
        </div>
        <form action="/api/billing/portal" method="post">
          <button type="submit" className="btn-sm">
            {d.openPortal}
          </button>
        </form>
      </section>
    </div>
  );
}
