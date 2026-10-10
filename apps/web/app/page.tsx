import Link from "next/link";
import type { Severity, Stip as StipColour } from "@maicro/core/types";
import { SECTOR_LIST } from "@maicro/core/prompts";
import { copy } from "@maicro/core/copy";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScanField } from "@/components/ScanField";
import { Stip, StipHero, StipRow, stipBg, type Tone } from "@/components/Stip";
import { CriteriumCard } from "@/components/CriteriumCard";
import { SectorCard } from "@/components/SectorCard";
import { PriceBlock } from "@/components/PriceBlock";
import { Faq } from "@/components/Faq";
import { ReportHeaderRow, ReportRow } from "@/components/ReportRow";
import { CountUp } from "@/components/CountUp";

const L = copy.landing;
const severities: Severity[] = ["afhaker", "misleider", "verwarring"];

function SectionHead({ h2, body, id }: { h2: string; body: string; id?: string }) {
  return (
    <div id={id} className="grid grid-cols-1 items-end gap-5 lg:grid-cols-12 lg:gap-12">
      <h2 className="h2 lg:col-span-6">{h2}</h2>
      <p className="lead lg:col-span-6">{body}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <span id="top" />
      <SiteHeader />
      <main>
        {/* 1 Hero */}
        <section className="wrap grid grid-cols-1 items-center gap-10 pb-16 pt-6 sm:pt-10 lg:grid-cols-12 lg:gap-12 lg:pb-24">
          <div className="flex flex-col gap-6 lg:col-span-5 lg:gap-7">
            <h1 className="h1 enter">{L.hero.h1}</h1>
            <p className="enter max-w-[36ch] text-[18px] leading-[1.5] text-ink-2 sm:text-[19px]" style={{ "--d": "90ms" } as React.CSSProperties}>
              {L.hero.sub}
            </p>
            <ScanField id="hero" className="enter max-w-[440px]" style={{ "--d": "180ms" } as React.CSSProperties} />
          </div>
          <div className="enter flex flex-col gap-4 lg:col-span-7" style={{ "--d": "120ms" } as React.CSSProperties}>
            <div className="scan-sweep grid grid-cols-10 gap-2 rounded-[20px] bg-panel p-4 sm:gap-3 sm:p-[26px]">
              {L.hero.grid.split("").map((c, i) => (
                // Ripple from the top-left corner: delay by row + column.
                <span key={i} aria-hidden className={`dot-in dot-hover aspect-square rounded-full ${c === "r" ? "bg-rood" : c === "g" ? "bg-groen" : "bg-grijs"}`} style={{ "--i": Math.floor(i / 10) + (i % 10) } as React.CSSProperties} />
              ))}
            </div>
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-2 text-[13px] text-muted">
              <span>
                <span className="tag mr-2">{L.hero.exampleLabel}</span>
                {L.hero.caption}
              </span>
              <span className="flex flex-wrap gap-4">
                {(["rood", "grijs", "groen"] as const).map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Stip tone={t} /> {L.hero.legend[t]}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </section>

        {/* 2 Wat er veranderde */}
        <section id="veranderd" className="bg-dark text-white">
          <div className="wrap section flex flex-col gap-10 lg:gap-12">
            <div className="grid grid-cols-1 items-end gap-5 lg:grid-cols-12 lg:gap-12">
              <h2 className="h2 lg:col-span-6">{L.veranderd.h2}</h2>
              <p className="text-[17px] leading-[1.55] text-dark-text sm:text-[18px] lg:col-span-6">{L.veranderd.body}</p>
            </div>
            <div data-motion="stagger" className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {L.veranderd.panels.map((p, i) => (
                <div key={p.year} className={`flex flex-col gap-4 rounded-[20px] p-7 ${i === 2 ? "bg-blue" : "bg-dark-panel"}`}>
                  <span className={`text-[13px] font-bold ${i === 2 ? "text-blue-light" : "text-grijs"}`}>{p.year}</span>
                  {i === 0 && (
                    <div aria-hidden data-motion="bars" className="flex flex-col gap-2">
                      {[92, 70, 84, 60, 78].map((w) => (
                        <span key={w} className="h-2.5 rounded-[3px] bg-dark-line" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  )}
                  {i === 1 && (
                    <div aria-hidden data-motion="bars" className="flex flex-col gap-2">
                      {[88, 55].map((w) => (
                        <span key={w} className="h-2.5 rounded-[3px] bg-white" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  )}
                  {i === 2 && (
                    <div aria-hidden className="flex items-center gap-2.5">
                      <span className="h-[26px] w-[26px] rounded-md border-2 border-white" />
                      <span className="h-2.5 flex-1 rounded-[3px] bg-white" />
                    </div>
                  )}
                  <span className="text-[20px] font-extrabold">{p.title}</span>
                  <span className={`text-[15px] leading-[1.5] ${i === 2 ? "" : "text-dark-text"}`}>{p.body}</span>
                </div>
              ))}
            </div>
            <div data-motion="stagger" className="grid grid-cols-1 gap-8 border-t border-dark-line pt-10 sm:grid-cols-3 sm:gap-10">
              {L.veranderd.stats.map((s) => (
                <div key={s.n}>
                  <div className="text-[36px] font-extrabold leading-none sm:text-[40px]" style={{ letterSpacing: "-1.5px" }}>
                    <CountUp value={s.n} />
                  </div>
                  <div className="mt-2 text-[15px] leading-[1.5] text-dark-text">{s.body}</div>
                  <div className="mt-1.5 text-[12px] text-muted">{s.source}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3 Zo leest AI over je bedrijf */}
        <section id="leest" className="wrap section flex flex-col gap-10">
          <SectionHead h2={L.leest.h2} body={L.leest.body} />
          <div data-motion="stagger" className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[260px_40px_1fr_40px_300px] lg:gap-0">
            <div className="flex flex-col gap-2">
              <span className="label mb-1">{L.leest.step1}</span>
              {L.leest.sources.map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl bg-panel px-3.5 py-2.5 text-[14px]">
                  <span>{s.label}</span>
                  <Stip tone={s.stip as StipColour} />
                </div>
              ))}
            </div>
            <div aria-hidden className="hidden justify-center lg:flex">
              <span data-motion="draw" className="h-0.5 w-6 bg-grijs" />
            </div>
            <div className="flex flex-col gap-2.5 rounded-[20px] bg-dark p-6 text-white">
              <span className="label text-grijs">{L.leest.step2}</span>
              <span className="text-[17px] font-bold leading-[1.35]">{L.leest.step2Title}</span>
              <span className="text-[15px] leading-[1.5] text-dark-text">{L.leest.step2Body}</span>
            </div>
            <div aria-hidden className="hidden justify-center lg:flex">
              <span data-motion="draw" className="h-0.5 w-6 bg-grijs" />
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="label mb-1">{L.leest.step3}</span>
              {L.leest.outcomes.map((o) => (
                <div key={o.label} className={`flex flex-col gap-1 rounded-2xl border-[1.5px] border-line px-4 py-3.5 ${o.tone === "grey" ? "bg-panel" : o.tone === "red" ? "bg-[#FEF2F2]" : ""}`}>
                  <span className={`text-[12px] font-semibold ${o.tone === "red" ? "text-[#B91C1C]" : "text-muted"}`}>{o.label}</span>
                  <span className="text-[15px]">{o.body}</span>
                </div>
              ))}
            </div>
          </div>
          <div data-motion="stagger" className="grid grid-cols-1 gap-6 border-t-[1.5px] border-line pt-8 md:grid-cols-3">
            {L.leest.takeaways.map((t) => (
              <div key={t.title} className="flex flex-col gap-1.5">
                <span className="text-[17px] font-extrabold">{t.title}</span>
                <span className="text-[15px] leading-[1.5] text-ink-2">{t.body}</span>
              </div>
            ))}
          </div>
          <p className="fine">{L.leest.footnote}</p>
        </section>

        {/* 4 Snippers */}
        <section className="bg-panel-2">
          <div className="wrap section flex flex-col gap-10">
            <SectionHead h2={L.snippers.h2} body={L.snippers.body} />
            <div data-motion="stagger" className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {L.snippers.examples.map((e) => (
                <div key={e.where} className="card-sm flex flex-col gap-1.5 p-[18px]">
                  <span className="text-[12px] font-semibold text-muted">{e.where}</span>
                  <span className="text-[16px] font-bold">
                    <span className="text-rood">{e.wrong}</span> → {e.right}
                  </span>
                  <span className="text-[13px] text-muted">{e.source}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
              <div data-motion="stagger" className="grid grid-cols-1 gap-6 text-[15px] leading-[1.5] text-ink-2 sm:grid-cols-3 lg:col-span-7">
                {L.snippers.shares.map((s) => (
                  <div key={s.n}>
                    <div className="text-[34px] font-extrabold text-ink" style={{ letterSpacing: "-1px" }}>
                      <CountUp value={s.n} />
                    </div>
                    {s.body}
                  </div>
                ))}
              </div>
              <div data-motion="rise" className="card-sm flex flex-col gap-2 p-[22px] lg:col-span-5">
                <span className="text-[14px] font-bold">{L.snippers.story.title}</span>
                <span className="text-[15px] leading-[1.5] text-ink-2">{L.snippers.story.body}</span>
                <span className="fine">{L.snippers.story.source}</span>
              </div>
            </div>
            <p className="fine">{L.snippers.footnote}</p>
          </div>
        </section>

        {/* 5 Geen loket */}
        <section className="wrap section grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-4 lg:col-span-6">
            <h2 className="h2">{L.loket.h2}</h2>
            <p className="lead max-w-[46ch]">{L.loket.body}</p>
          </div>
          <div data-motion="timeline" className="flex flex-col gap-2.5 lg:col-span-6">
            {L.loket.timeline.map((t) => (
              <StipRow key={t.text} tone={t.stip as StipColour} text={t.text} meta={t.meta} />
            ))}
          </div>
        </section>

        {/* 6 Zo werkt Maicro */}
        <section id="werkt" className="bg-panel-2">
          <div className="wrap section flex flex-col gap-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="h2">{L.werkt.h2}</h2>
              <p className="max-w-[40ch] text-[15px] text-muted">{L.werkt.sub}</p>
            </div>
            <ol data-motion="stagger" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {L.werkt.steps.map((s) => (
                <li key={s.n} className="card flex flex-col gap-3.5 rounded-[20px] p-6">
                  <span data-pop className={`flex h-11 w-11 items-center justify-center rounded-full font-extrabold text-white ${stipBg[s.tone as Tone]}`}>{s.n}</span>
                  <span className="text-[20px] font-extrabold">{s.title}</span>
                  <span className="text-[15px] leading-[1.55] text-ink-2">{s.body}</span>
                  <span className="mt-auto rounded-[10px] bg-panel px-3 py-2 text-[13px] text-muted">{s.meta}</span>
                </li>
              ))}
            </ol>
            <div className="grid grid-cols-1 items-center gap-6 border-t-[1.5px] border-line pt-10 lg:grid-cols-12 lg:gap-12">
              <p className="text-[15px] leading-[1.55] text-ink-2 lg:col-span-7">{L.werkt.note}</p>
              <div data-motion="stagger" className="flex flex-wrap gap-2.5 lg:col-span-5">
                {L.werkt.engines.map((e) => (
                  <span key={e} className="pill">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7 Criteria */}
        <section id="criteria" className="wrap section flex flex-col gap-10">
          <SectionHead h2={L.criteria.h2} body={L.criteria.body} />
          <div data-motion="stagger" className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {severities.map((s) => (
              <CriteriumCard key={s} severity={s}>
                {s === "verwarring" && (
                  <p className="mt-auto rounded-xl bg-panel px-3.5 py-3 text-[14px] leading-[1.5]">
                    <span className="font-bold">{L.criteria.plus.strong}</span> {L.criteria.plus.body}
                  </p>
                )}
              </CriteriumCard>
            ))}
          </div>
          <div data-motion="stagger" className="flex flex-wrap gap-x-7 gap-y-3 border-t-[1.5px] border-line pt-6 text-[14px] text-muted">
            {L.criteria.legend.map((l) => (
              <span key={l.stip} className="flex items-center gap-2">
                <Stip tone={l.stip as StipColour} size={12} />
                <span>
                  <span className="font-bold text-ink">{l.name}</span> — {l.body}
                </span>
              </span>
            ))}
          </div>
        </section>

        {/* 8 Per vak */}
        <section id="vak" className="bg-panel-2">
          <div className="wrap section flex flex-col gap-9">
            <SectionHead h2={L.vak.h2} body={L.vak.body} />
            <div data-motion="stagger" className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {SECTOR_LIST.map((p) => (
                <SectorCard key={p.slug} slug={p.slug} />
              ))}
              <div className="flex flex-col justify-center gap-1.5 rounded-2xl bg-dark p-[18px] text-white">
                <span className="text-[16px] font-extrabold">{L.vak.other.title}</span>
                <span className="text-[14px] leading-[1.5] text-dark-text">{L.vak.other.body}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 9 Voorbeeldrapport */}
        <section id="rapport" className="wrap section flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="h2">{L.rapport.h2}</h2>
            <span className="text-[15px] text-muted">{L.rapport.meta}</span>
          </div>
          <div data-motion="rise" className="grid grid-cols-1 items-center gap-8 rounded-panel border-[1.5px] border-line p-5 shadow-float sm:p-9 lg:grid-cols-12 lg:gap-10">
            <div className="flex justify-center lg:col-span-3">
              <StipHero tone="rood" number={L.rapport.stipNumber} label={L.rapport.stipLabel} size={180} />
            </div>
            <div data-motion="stagger" className="flex min-w-0 flex-col lg:col-span-9">
              <p className="mb-3.5 text-[20px] font-extrabold sm:text-[22px]" style={{ letterSpacing: "-0.5px" }}>
                {L.rapport.title}
              </p>
              <ReportHeaderRow compact />
              {L.rapport.rows.map((r) => (
                <ReportRow key={r.q} compact row={{ question: r.q, said: r.said, tone: r.tone as "rood" | "grijs" | "groen", correct: r.right, source: r.source }} />
              ))}
              <Link href="/r/voorbeeld" className="btn-link mt-3.5 self-start">
                {L.rapport.link}
              </Link>
            </div>
          </div>
        </section>

        {/* 10 Bewijs */}
        <section className="bg-panel-2">
          <div className="wrap section flex flex-col gap-8">
            <h2 className="h2">{L.bewijs.h2}</h2>
            <div data-motion="stagger" className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {L.bewijs.cards.map((c) => (
                <div key={c.business} className="card flex flex-col gap-3 rounded-[20px] p-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-bold">{c.business}</span>
                    <span className="tag">{L.bewijs.label}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[15px]">
                    <Stip tone="rood" size={14} />
                    <span>{c.before}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[15px] font-bold">
                    <Stip tone="groen" size={14} />
                    <span>{c.after}</span>
                  </div>
                  <span className="text-[13px] text-muted">{c.source}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 11 Missie */}
        <section className="wrap section grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <h2 className="h2">{L.missie.h2}</h2>
            <p className="lead max-w-[50ch]">{L.missie.body}</p>
          </div>
          <div data-motion="timeline" className="flex flex-col gap-2.5 lg:col-span-5">
            {L.missie.timeline.map((t) => (
              <StipRow key={t.text} tone={t.stip as StipColour} text={t.text} meta={t.meta} />
            ))}
            <p className="fine">{L.missie.footnote}</p>
          </div>
        </section>

        {/* 12 Prijs */}
        <section id="prijs" className="bg-dark text-white">
          <div className="wrap section">
            <PriceBlock />
          </div>
        </section>

        {/* 13 Vragen */}
        <Faq />

        {/* 14 Slot */}
        <section className="bg-panel-2">
          <div className="wrap section flex flex-col items-center gap-6 text-center">
            <h2 className="h2 max-w-[20ch] text-[34px] sm:text-[42px] lg:text-[48px]">{L.slot.h2}</h2>
            <p className="max-w-[44ch] text-[18px] text-ink-2">{L.slot.body}</p>
            <ScanField id="slot" className="max-w-[460px]" button={L.slot.button} note={false} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
