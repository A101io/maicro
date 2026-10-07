import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { copy, PRICES } from "@maicro/core/copy";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ReportHeader, ReportFindingCard, EnginesRow, CorrectAnswers } from "@/components/report";
import { getScanReport, latestScanReport } from "@/lib/core";
import { ready } from "@/lib/db";
import { env } from "@/lib/env";
import { hostOf } from "@/lib/format";
import { ENGINE_LABEL } from "@maicro/core/types";
import { questionFor, wrongText, correctText } from "@/lib/questions";
import { ShareLink } from "./ShareLink";
import { EmailCapture } from "./EmailCapture";
import { ShowAll } from "./ShowAll";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const report = (await getScanReport(id)) ?? (await latestScanReport(id));
  if (!report) return { title: copy.result.notFound };
  return { title: copy.email.subjects.report(report.business.name), robots: { index: false } };
}

export default async function ResultPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ mail?: string; alle?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const report = (await getScanReport(id)) ?? (await latestScanReport(id));
  if (!report) notFound();
  const business = await (await ready()).getBusiness(report.business.id);
  const R = copy.result;
  const findings = report.findings;
  const shareUrl = `${env.baseUrl}/r/${report.scanRunId}`;

  return (
    <>
      <SiteHeader minimal />
      <main className="container max-w-[960px] py-10 sm:py-14">
        <ReportHeader report={report} />

        {findings.length > 0 && (
          <section className="mt-8">
            <ShowAll initial={5} total={findings.length} label={R.showAll(findings.length)}>
              {findings.map((f) => (
                <ReportFindingCard key={f.id} finding={f} business={report.business} checkedAt={report.checkedAt} />
              ))}
            </ShowAll>
          </section>
        )}

        <section className="mt-8 space-y-4">
          <CorrectAnswers items={report.correct} />
          <EnginesRow engines={report.engines} />
        </section>

        {findings.length > 0 && <p className="mt-10 max-w-[52ch] font-serif text-[26px] leading-[1.2]">{R.consequence}</p>}

        {/* CTA */}
        <section className="card mt-10 p-6 sm:p-8">
          <h2 className="font-sans text-[22px] font-semibold tracking-normal">{R.cta.h3}</h2>
          <p className="mt-2 max-w-[60ch] text-[16px]">{R.cta.body}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <form action="/api/checkout" method="post">
              <input type="hidden" name="business" value={report.business.id} />
              <input type="hidden" name="scan" value={report.scanRunId} />
              <input type="hidden" name="plan" value="monitor" />
              <button type="submit" className="btn-primary h-auto min-h-[52px] w-full whitespace-normal py-3 sm:w-auto">
                {R.cta.monitor}
              </button>
            </form>
            <form action="/api/checkout" method="post">
              <input type="hidden" name="business" value={report.business.id} />
              <input type="hidden" name="scan" value={report.scanRunId} />
              <input type="hidden" name="plan" value="setup" />
              <button type="submit" className="btn-secondary h-auto min-h-[52px] w-full whitespace-normal py-3 sm:w-auto">
                {R.cta.setup}
              </button>
            </form>
          </div>
          <p className="mono mt-4">
            {R.cta.exclVat} {copy.landing.pricing.footnote}
          </p>
          <p className="sr-only">
            {PRICES.setupEur} / {PRICES.monitorEurPerMonth}
          </p>
        </section>

        {/* Zelf oplossen (not-found findings have no source to fix) */}
        {findings.some((f) => f.verdict !== "not_found") && (
          <details className="card mt-4">
            <summary className="flex items-center justify-between px-5 py-4 text-[15px] font-medium">
              <span>{R.selfFix.summary}</span>
              <span aria-hidden className="font-mono text-secondary">+</span>
            </summary>
            <div className="border-t border-rule px-5 py-4">
              <p className="text-[15px] text-secondary">{R.selfFix.intro}</p>
              <ul className="mt-3 divide-y divide-rule">
                {findings.filter((f) => f.verdict !== "not_found").map((f) => (
                  <li key={f.id} className="grid gap-1 py-3 text-[14px] sm:grid-cols-[200px_1fr] sm:gap-4">
                    <span className="font-mono text-[13px] break-all">
                      {f.sourceUrl ? (
                        <a href={f.sourceUrl} target="_blank" rel="nofollow noopener">
                          {hostOf(f.sourceUrl)}
                        </a>
                      ) : (
                        copy.sourceType[f.sourceType]
                      )}
                    </span>
                    <span>
                      <span className="text-secondary">{questionFor(f.factKey, f.subject, report.business.name, report.business.place)}</span>
                      <br />
                      {ENGINE_LABEL[f.engine]}: <span className="mark-wrong">{wrongText(f)}</span> → {correctText(f)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        )}

        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-rule pt-8 md:grid-cols-2">
          <ShareLink url={shareUrl} />
          <EmailCapture scanRunId={report.scanRunId} businessId={report.business.id} sent={sp.mail === "ok" || Boolean(business?.ownerEmail)} invalid={sp.mail === "fout"} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
