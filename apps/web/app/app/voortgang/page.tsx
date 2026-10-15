import Link from "next/link";
import { ENGINES, ENGINE_LABEL, type Engine } from "@vidalo/core/types";
import { BUNDLES, PERIODS, changeOver, criteriumGrid, engineGrid, filterCells, inPeriod, repairSummary, snapshotStip, tally, type Bundle, type Change, type GridCell, type Period, type ProgressFilter, type Tally } from "@vidalo/core/progress";
import { getI18n } from "@/lib/i18n";
import { requireOwner } from "@/lib/owner";
import { loadDashboard } from "@/lib/reads";
import { loadSnapshots } from "@/lib/core";
import { Stip } from "@/components/Stip";
import { dateShort, dayMonth } from "@/lib/format";

type Search = { periode?: string; ai?: string; vragen?: string };

const DEFAULT_PERIOD: Period = "12m";
/** Most scans shown as columns in the dot grids; the per-check list shows them all. */
const GRID_COLUMNS = 12;

function pick<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** One filter choice: a link that keeps the other two filters. */
function Chip({ active, href, children }: { active: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`inline-flex h-9 items-center rounded-pill border-[1.5px] px-3.5 text-[14px] font-semibold transition-colors ${active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-ink"}`}
    >
      {children}
    </Link>
  );
}

/** Counts as a bar inside a report row: green, red and grey segments, the numbers written next to it. */
function CountBar({ t }: { t: Tally }) {
  if (t.total === 0) return <div className="h-2.5 rounded-pill bg-panel" />;
  const w = (n: number) => `${(n / t.total) * 100}%`;
  return (
    <div className="flex h-2.5 overflow-hidden rounded-pill bg-panel" aria-hidden>
      <span className="bg-groen" style={{ width: w(t.correct) }} />
      <span className="bg-rood" style={{ width: w(t.wrong) }} />
      <span className="bg-grijs" style={{ width: w(t.notFound) }} />
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card-sm flex flex-col gap-1.5 p-5">
      <span className="text-[13px] font-semibold text-muted">{label}</span>
      <span className="text-[26px] font-extrabold leading-tight" style={{ letterSpacing: "-0.5px" }}>
        {value}
      </span>
      <span className="text-[13px] text-muted">{sub}</span>
    </div>
  );
}

function DotGrid({ rows, dates, notAsked, missesTitle }: { rows: { label: string; cells: GridCell[] }[]; dates: string[]; notAsked: string; missesTitle: (n: number) => string }) {
  return (
    <div className="card mt-3 overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-[14px]">
        <thead>
          <tr className="border-b-[1.5px] border-line text-[12px] text-muted">
            <th className="sticky left-0 bg-white px-5 py-3 text-left font-semibold" />
            {dates.map((d, i) => (
              <th key={i} className="px-2 py-3 text-center font-semibold whitespace-nowrap">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b-[1px] border-line last:border-0">
              <th scope="row" className="sticky left-0 bg-white px-5 py-3 text-left font-semibold whitespace-nowrap">
                {r.label}
              </th>
              {r.cells.map((c, i) => (
                <td key={i} className="px-2 py-2.5 text-center align-top">
                  {c.stip ? (
                    <span className="inline-flex flex-col items-center gap-1" title={missesTitle(c.misses)}>
                      <Stip tone={c.stip} size={12} />
                      <span className="text-[11px] leading-none text-muted">{c.misses > 0 ? c.misses : "\u00a0"}</span>
                    </span>
                  ) : (
                    <span className="text-muted" title={notAsked}>
                      ·
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function ProgressPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const { business } = await requireOwner();
  const { copy, href } = await getI18n();
  const p = copy.progress;
  const [all, data] = await Promise.all([loadSnapshots(business.id), loadDashboard(business.id)]);

  const seenEngines = ENGINES.filter((e) => all.some((s) => s.engines.includes(e)));
  const period = pick(sp.periode, PERIODS, DEFAULT_PERIOD);
  const engine = pick<Engine | "all">(sp.ai, ["all", ...seenEngines], "all");
  const bundle = pick<Bundle>(sp.vragen, BUNDLES, "all");
  const filter: ProgressFilter = { engine, bundle };

  const link = (over: Partial<Record<keyof Search, string>>) => {
    const q = new URLSearchParams();
    const next = { periode: period, ai: engine, vragen: bundle, ...over };
    if (next.periode !== DEFAULT_PERIOD) q.set("periode", next.periode);
    if (next.ai !== "all") q.set("ai", next.ai);
    if (next.vragen !== "all") q.set("vragen", next.vragen);
    const qs = q.toString();
    return href(`/app/voortgang${qs ? `?${qs}` : ""}`);
  };

  const snaps = inPeriod(all, period);
  const latest = snaps[snaps.length - 1];
  const change = changeOver(snaps, filter);
  const now = latest ? tally(filterCells(latest.cells, filter)) : null;
  const recFilter: ProgressFilter = { engine, bundle: "recommendation" };
  const namedNow = latest ? tally(filterCells(latest.cells, recFilter)) : null;
  const namedChange = changeOver(snaps, recFilter);
  const repairs = repairSummary(data.findings, period, filter);
  const changeLine = (c: Change | null, key: "correct" | "wrong" | "notFound") => (c ? p.change(c[key], dayMonth(c.base.checkedAt)) : p.noChange);

  const gridSnaps = snaps.slice(-GRID_COLUMNS);
  const gridDates = gridSnaps.map((s) => dayMonth(s.checkedAt));
  const factRows = criteriumGrid(gridSnaps, filter).map((r) => ({ label: copy.criteria[r.criterium], cells: r.cells }));
  const engineRows = engine === "all" ? engineGrid(gridSnaps, bundle).map((r) => ({ label: ENGINE_LABEL[r.engine], cells: r.cells })) : [];
  const latestStip = latest ? snapshotStip(latest, filter) : null;

  return (
    <div className="space-y-10">
      <header className="flex items-start gap-4">
        {latestStip && <Stip tone={latestStip} size={22} className="mt-3" />}
        <div>
          <h1 className="h2">{p.h1}</h1>
          <p className="mt-2 text-[17px] text-ink-2">{p.intro}</p>
        </div>
      </header>

      {all.length === 0 ? (
        <p className="rounded-xl bg-panel px-5 py-4 text-[15px]">{p.empty}</p>
      ) : (
        <>
          {/* Filters */}
          <section className="card space-y-4 p-5" aria-label={p.filters.bundle}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <span className="w-32 shrink-0 text-[13px] font-semibold text-muted">{p.filters.bundle}</span>
              <div className="flex flex-wrap gap-2">
                {BUNDLES.map((b) => (
                  <Chip key={b} active={b === bundle} href={link({ vragen: b })}>
                    {p.bundles[b]}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <span className="w-32 shrink-0 text-[13px] font-semibold text-muted">{p.filters.engine}</span>
              <div className="flex flex-wrap gap-2">
                <Chip active={engine === "all"} href={link({ ai: "all" })}>
                  {p.allEngines}
                </Chip>
                {seenEngines.map((e) => (
                  <Chip key={e} active={e === engine} href={link({ ai: e })}>
                    {ENGINE_LABEL[e]}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <span className="w-32 shrink-0 text-[13px] font-semibold text-muted">{p.filters.period}</span>
              <div className="flex flex-wrap gap-2">
                {PERIODS.map((x) => (
                  <Chip key={x} active={x === period} href={link({ periode: x })}>
                    {p.periods[x]}
                  </Chip>
                ))}
              </div>
            </div>
            <p className="border-t-[1px] border-line pt-4 text-[14px] text-ink-2">{p.bundleHelp[bundle]}</p>
          </section>

          {!latest || !now ? (
            <p className="rounded-xl bg-panel px-5 py-4 text-[15px]">{p.emptyFilter}</p>
          ) : (
            <>
              {/* Indicators */}
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {bundle === "recommendation" ? (
                  <>
                    <Tile label={p.indicators.named} value={p.of(now.correct, now.total)} sub={changeLine(change, "correct")} />
                    <Tile label={p.indicators.notFound} value={String(now.notFound)} sub={changeLine(change, "notFound")} />
                  </>
                ) : (
                  <>
                    <Tile label={p.indicators.correct} value={p.of(now.correct, now.total)} sub={changeLine(change, "correct")} />
                    <Tile label={p.indicators.wrong} value={String(now.wrong)} sub={changeLine(change, "wrong")} />
                    <Tile label={p.indicators.notFound} value={String(now.notFound)} sub={changeLine(change, "notFound")} />
                    {namedNow && namedNow.total > 0 && <Tile label={p.indicators.named} value={p.of(namedNow.correct, namedNow.total)} sub={changeLine(namedChange, "correct")} />}
                  </>
                )}
                <Tile label={p.indicators.repaired} value={String(repairs.resolved)} sub={repairs.medianDays !== null ? p.medianDays(repairs.medianDays) : p.repairedLine(repairs.open, repairs.inProgress)} />
              </section>
              {snaps.length === 1 && <p className="text-[15px] text-muted">{p.oneRun}</p>}

              {/* Per check, newest first */}
              <section>
                <h2 className="h3">{p.sections.runs}</h2>
                <ol className="card mt-3 divide-y-[1px] divide-line">
                  {[...snaps].reverse().map((s) => {
                    const t = tally(filterCells(s.cells, filter));
                    const dot = snapshotStip(s, filter);
                    return (
                      <li key={s.scanRunId} className="grid gap-3 px-5 py-4 sm:grid-cols-[230px_1fr] sm:items-center sm:gap-6">
                        <div className="flex items-center gap-3">
                          {dot ? <Stip tone={dot} size={14} /> : <span className="inline-block h-3.5 w-3.5" />}
                          <div>
                            <Link href={href(`/r/${s.scanRunId}`)} className="font-semibold hover:text-blue">
                              {dateShort(s.checkedAt)}
                            </Link>
                            <p className="text-[13px] text-muted">
                              {p.scanKind[s.kind]} · {p.enginesAsked(s.engines.length)}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <CountBar t={t} />
                          <p className="text-[13px] text-ink-2">{t.total === 0 ? p.notAsked : bundle === "recommendation" ? p.runNamed(t.correct, t.total) : p.runCounts(t.correct, t.wrong, t.notFound)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>

              {/* Per fact */}
              {factRows.length > 0 && (
                <section>
                  <h2 className="h3">{p.sections.facts}</h2>
                  <DotGrid rows={factRows} dates={gridDates} notAsked={p.notAsked} missesTitle={p.misses} />
                </section>
              )}

              {/* Per AI system */}
              {engineRows.length > 0 && (
                <section>
                  <h2 className="h3">{p.sections.engines}</h2>
                  <DotGrid rows={engineRows} dates={gridDates} notAsked={p.notAsked} missesTitle={p.misses} />
                </section>
              )}
              <p className="text-[13px] text-muted">{p.legend}</p>
            </>
          )}

          {/* Repairs */}
          <section>
            <h2 className="h3">{p.sections.repairs}</h2>
            <dl className="card mt-3 grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x-[1px]">
              {(["found", "resolved", "open", "inProgress"] as const).map((k) => (
                <div key={k} className="px-5 py-4">
                  <dt className="text-[13px] font-semibold text-muted">{p.repairs[k]}</dt>
                  <dd className="mt-1 text-[22px] font-extrabold">{repairs[k]}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-[14px] text-ink-2">{repairs.medianDays !== null ? p.medianDays(repairs.medianDays) : p.noRepairs}</p>
          </section>

          <p className="max-w-[720px] text-[13px] text-muted">{p.method}</p>
        </>
      )}
    </div>
  );
}
