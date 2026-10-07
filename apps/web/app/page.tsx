import Link from "next/link";
import { copy } from "@maicro/core/copy";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScanField } from "@/components/ScanField";
import { HeroExamples } from "@/components/HeroExamples";
import { ThreePanels } from "@/components/ThreePanels";
import { Pricing } from "@/components/Pricing";
import { Faq } from "@/components/Faq";
import { ReportHeader, ReportFindingCard, EnginesRow, CorrectAnswers } from "@/components/report";
import { Chip } from "@/components/FindingCard";
import { demoReport } from "@/lib/demo";

export default function LandingPage() {
  const L = copy.landing;
  const report = demoReport();

  return (
    <>
      <SiteHeader />
      <main>
        {/* 1. Hero */}
        <section id="controle" className="container grid grid-cols-1 gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="lg:col-span-5">
            <p className="eyebrow">{L.hero.eyebrow}</p>
            <h1 className="h1 mt-3">{L.hero.h1}</h1>
            <p className="prose-measure mt-5 text-[19px] leading-[1.5]">{L.hero.sub}</p>
            <div className="mt-7">
              <ScanField />
            </div>
            <p className="mt-5 text-[13px] text-secondary">
              {L.hero.trust.map((t, i) => (
                <span key={t}>
                  {i > 0 && <span aria-hidden>{"\u00a0· "}</span>}
                  {t}
                </span>
              ))}
            </p>
          </div>
          <div className="lg:col-span-7 lg:pl-6">
            <HeroExamples />
          </div>
        </section>

        {/* 2. De verschuiving + Wat is er veranderd */}
        <section className="section rule-top">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <h2 className="h2">{L.shift.h2}</h2>
              </div>
              <div className="lg:col-span-7">
                <p className="max-w-[60ch] text-[18px] leading-[1.55]">{L.shift.body}</p>
                <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-[28px] leading-none">{L.shift.stat}</span>
                  <span className="text-[15px]">{L.shift.statLabel}</span>
                </p>
                <p className="mono mt-1">{L.shift.statSource}</p>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <h3 className="font-serif text-[28px] font-normal leading-[1.1]">{L.changed.h2}</h3>
                <p className="mt-3 max-w-[48ch] text-[16px]">{L.changed.body}</p>
                <p className="mt-3 max-w-[48ch] text-[16px]">{L.changed.agent}</p>
                <p className="mt-3 max-w-[48ch] text-[16px] font-medium">{L.changed.closing}</p>
              </div>
              <div className="lg:col-span-7">
                <ThreePanels />
              </div>
            </div>
          </div>
        </section>

        {/* 3. De schade */}
        <section className="section rule-top">
          <div className="container grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="h2">{L.damage.h2}</h2>
            </div>
            <div className="lg:col-span-7">
              <p className="max-w-[60ch] text-[18px] leading-[1.55]">{L.damage.body}</p>
              <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-[28px] leading-none">{L.damage.stat}</span>
                <span className="text-[15px]">{L.damage.statLabel}</span>
              </p>
              <p className="mono mt-1">{L.damage.statSource}</p>
            </div>
          </div>
        </section>

        {/* 4. Geen loket */}
        <section className="section rule-top">
          <div className="container grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="h2">{L.noDesk.h2}</h2>
            </div>
            <div className="lg:col-span-7">
              <p className="max-w-[60ch] text-[18px] leading-[1.55]">{L.noDesk.body}</p>
            </div>
          </div>
        </section>

        {/* 5. Zo werkt Maicro */}
        <section id="hoe" className="section rule-top">
          <div className="container">
            <h2 className="h2">{L.how.h2}</h2>
            <ol className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {L.how.steps.map((s) => (
                <li key={s.n} className="card flex flex-col p-5">
                  <span className="font-mono text-[13px] text-secondary">{s.n}</span>
                  <h3 className="mt-3 text-[20px] font-semibold sm:mt-6">{s.title}</h3>
                  <p className="mt-2 text-[15px] text-ink">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 6. Een voorbeeldrapport */}
        <section id="voorbeeld" className="section rule-top">
          <div className="container">
            <h2 className="h2">{L.exampleReport.h2}</h2>
            <p className="mono mt-2">{L.exampleReport.intro}</p>
            <div className="mt-8 rounded-card border border-rule bg-paper p-4 sm:p-8">
              <div className="mb-2 flex items-center gap-2">
                <Chip tone="neutral">{L.proof.label}</Chip>
              </div>
              <ReportHeader report={report} as="p" />
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {report.findings.slice(0, 2).map((f) => (
                  <ReportFindingCard key={f.id} finding={f} business={report.business} checkedAt={report.checkedAt} />
                ))}
              </div>
              <div className="mt-6 space-y-4">
                <CorrectAnswers items={report.correct} />
                <EnginesRow engines={report.engines} />
              </div>
            </div>
          </div>
        </section>

        {/* 6b. Bewijs */}
        <section className="section rule-top">
          <div className="container">
            <h2 className="h2">{L.proof.h2}</h2>
            <ul className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
              {L.proof.cards.map((c) => (
                <li key={c.business} className="card flex flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold">{c.business}</span>
                    <Chip tone="neutral">{L.proof.label}</Chip>
                  </div>
                  <p className="mt-4 text-[15px]">
                    <span className="mark-wrong">{c.before}</span>
                  </p>
                  <p className="mt-2 text-[15px]">
                    <Chip tone="ok">{c.after}</Chip>
                  </p>
                  <p className="mono mt-4">{c.source}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 7. Prijzen */}
        <Pricing />

        {/* 8. FAQ */}
        <Faq />

        {/* 9. Slot */}
        <section className="section rule-top">
          <div className="container flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="h2 max-w-[20ch]">{L.closing.h2}</h2>
            <Link href="/#controle" className="btn-primary no-underline hover:no-underline">
              {L.closing.button}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
