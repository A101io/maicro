import type { Finding, ScanReport, Engine, FindingStatus, SourceType } from "@maicro/core/types";
import { ENGINE_LABEL } from "@maicro/core/types";
import { copy } from "@maicro/core/copy";
import { FindingCard, Chip, type FindingTone } from "./FindingCard";
import { questionFor, wrongText, correctText } from "@/lib/questions";
import { dateShort, hostOf } from "@/lib/format";

export const statusTone: Record<FindingStatus, FindingTone> = {
  open: "wrong",
  fixing: "doubt",
  recheck: "doubt",
  resolved: "ok",
  unfixable: "neutral",
};

function sourceChip(t: SourceType): { label: string; tone: FindingTone } {
  if (t === "none") return { label: "Geen bron", tone: "neutral" };
  if (t === "other_entity") return { label: "Ander bedrijf", tone: "doubt" };
  return { label: "Bron verouderd", tone: "doubt" };
}

export function ReportFindingCard({ finding, business, checkedAt }: { finding: Finding; business: { name: string; place: string }; checkedAt: string }) {
  const c = copy.result.card;
  const engine = ENGINE_LABEL[finding.engine];
  const host = hostOf(finding.sourceUrl);
  return (
    <FindingCard
      engine={engine}
      date={dateShort(checkedAt)}
      labels={{ question: c.question, said: c.said(engine) }}
      question={questionFor(finding.factKey, finding.subject, business.name, business.place)}
      answer={{ before: "", wrong: wrongText(finding), after: "" }}
      correct={{
        label: c.wrong,
        value:
          finding.sourceType === "other_entity"
            ? `dit gaat over een ander bedrijf met dezelfde naam, niet over ${business.name} in ${business.place}`
            : correctText(finding),
      }}
      frequency={c.frequency(finding.frequency, finding.sampleCount)}
      source={{
        label: c.source,
        chip: sourceChip(finding.sourceType),
        text: finding.sourceUrl ? (
          <>
            <a href={finding.sourceUrl} rel="nofollow noopener" target="_blank" className="font-mono text-[14px] break-all">
              {host}
            </a>{" "}
            <span className="text-secondary">({copy.sourceType[finding.sourceType]})</span>
          </>
        ) : (
          <span className="text-secondary">{finding.sourceType === "other_entity" ? copy.sourceType.other_entity : c.noSource}</span>
        ),
      }}
      fix={{
        label: c.action,
        chip: { label: copy.findingStatus[finding.status], tone: statusTone[finding.status] },
        text: copy.fixPath[finding.sourceType],
      }}
    />
  );
}

export function EnginesRow({ engines }: { engines: ScanReport["engines"] }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[13px] text-secondary">
      <span className="text-ink">{copy.result.enginesRow}:</span>
      {engines.map((e) => (
        <span key={e.engine} className="inline-flex items-center gap-1.5">
          <span className="text-ink">{ENGINE_LABEL[e.engine]}</span>
          {e.skipped ? (
            <span>{copy.result.engineSkipped}</span>
          ) : (
            <>
              <span className="text-ok">✓ {e.correct}</span>
              <span className="text-wrong">✗ {e.wrong}</span>
            </>
          )}
        </span>
      ))}
    </div>
  );
}

export function CorrectAnswers({ items }: { items: ScanReport["correct"] }) {
  if (!items.length) return null;
  return (
    <details className="card">
      <summary className="flex items-center justify-between px-5 py-4 text-[15px]">
        <span>{copy.result.correctCollapsed(items.length)}</span>
        <span aria-hidden className="font-mono text-secondary">+</span>
      </summary>
      <ul className="divide-y divide-rule border-t border-rule">
        {items.map((c, i) => (
          <li key={i} className="grid gap-1 px-5 py-3 text-[14px] sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-4">
            <span>
              <span className="italic text-secondary">{c.prompt}</span>
              <span className="ml-2 font-mono text-[13px] text-secondary">{ENGINE_LABEL[c.engine as Engine]}</span>
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-[13px]">
              <Chip tone="ok">klopt</Chip>
              <span>{c.value}</span>
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function ReportHeader({ report, as: Tag = "h1" }: { report: ScanReport; as?: "h1" | "h2" | "p" }) {
  return (
    <header className="space-y-3">
      <Tag className="font-serif text-[28px] font-normal leading-[1.1] sm:text-[36px]" style={{ letterSpacing: "-0.5px" }}>{copy.result.title(report.business.name, dateShort(report.checkedAt))}</Tag>
      <p className="text-[17px]">
        {copy.result.summaryIntro(report.totalAnswers)}{" "}
        {report.wrongAnswers > 0 ? <strong className="font-semibold">{copy.result.summaryCount(report.wrongAnswers)}</strong> : copy.result.summaryAllOk}
      </p>
    </header>
  );
}
