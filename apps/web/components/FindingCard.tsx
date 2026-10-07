import type { ReactNode } from "react";

export type FindingTone = "wrong" | "doubt" | "ok" | "neutral";

export interface FindingCardProps {
  /** e.g. "ChatGPT" */
  engine: string;
  /** e.g. "7 okt 2026" */
  date: string;
  question: string;
  /** Answer text split around the one highlighted (wrong) phrase. */
  answer: { before: string; wrong: string; after: string };
  /** "Klopt niet: zondag gesloten" line under the answer (real reports). Tone defaults to "wrong"; "neutral" for not found. */
  correct?: { label: string; value: string; tone?: FindingTone };
  /** Optional frequency chip, e.g. "3 van 3 keer". */
  frequency?: string;
  /** The source row. Omitted for a not-found finding: there is no source, the engine simply has nothing. */
  source?: {
    /** Row label, e.g. "Gevonden bron" / "Waar het vandaan komt" */
    label: string;
    text: ReactNode;
    chip?: { label: string; tone: FindingTone };
  };
  /** Grey instead of red marking for the answer (not found). */
  muted?: boolean;
  fix: {
    label?: string;
    chip: { label: string; tone: FindingTone };
    text: ReactNode;
  };
  /** Small mono labels above the question and the answer (report view). */
  labels?: { question?: string; said?: string };
  /** Fade the three rows in once on load (hero only). */
  animate?: boolean;
  className?: string;
}

const chipClass: Record<FindingTone, string> = {
  wrong: "chip-wrong",
  doubt: "chip-doubt",
  ok: "chip-ok",
  neutral: "chip-neutral",
};

export function Chip({ tone, children }: { tone: FindingTone; children: ReactNode }) {
  return <span className={chipClass[tone]}>{children}</span>;
}

/**
 * The one component the marketing page and the product share: a chat-style
 * answer with the wrong phrase marked, the source it came from, and the fix.
 */
export function FindingCard({ engine, date, question, answer, correct, frequency, source, fix, labels, muted = false, animate = false, className = "" }: FindingCardProps) {
  const a = (n: 1 | 2 | 3) => (animate ? `rise rise-${n}` : "");
  const markClass = muted ? "bg-paper text-secondary" : "mark-wrong text-ink";
  return (
    <div className={`w-full max-w-[640px] ${className}`}>
      {/* Row 1: the answer */}
      <div className={`card p-5 ${a(1)}`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span aria-hidden className="inline-block h-5 w-5 rounded-full border border-rule bg-paper" />
            <span className="font-mono text-[12px] text-secondary">
              {engine} · {date}
            </span>
          </div>
          {frequency && <span className="font-mono text-[12px] text-secondary">{frequency}</span>}
        </div>
        {labels?.question && <span className="eyebrow block">{labels.question}</span>}
        <p className="mb-2 text-[15px] italic text-secondary">{question}</p>
        {labels?.said && <span className="eyebrow block">{labels.said}</span>}
        <p className="text-[16px] leading-[1.6]">
          {answer.before}
          <mark className={markClass}>{answer.wrong}</mark>
          {answer.after}
        </p>
        {correct && (
          <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-rule pt-3 text-[15px]">
            <Chip tone={correct.tone ?? "wrong"}>{correct.label}</Chip>
            <span>{correct.value}</span>
          </p>
        )}
      </div>

      {source && (
        <>
          {/* Connector */}
          <div aria-hidden className={`ml-7 h-5 w-px border-l border-dashed border-wrong ${a(2)}`} />

          {/* Row 2: the source */}
          <div className={`card border-l-2 border-l-wrong px-5 py-4 ${a(2)}`}>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <span className="eyebrow">{source.label}</span>
              {source.chip && <Chip tone={source.chip.tone}>{source.chip.label}</Chip>}
            </div>
            <div className="text-[15px] leading-[1.5]">{source.text}</div>
          </div>
        </>
      )}

      {/* Row 3: the fix */}
      <div className={`mt-2 flex flex-col gap-2 rounded-card border border-rule bg-paper px-5 py-4 sm:flex-row sm:items-start sm:gap-4 ${a(3)}`}>
        <div className="flex shrink-0 items-center gap-2">
          {fix.label && <span className="eyebrow">{fix.label}</span>}
          <Chip tone={fix.chip.tone}>{fix.chip.label}</Chip>
        </div>
        <div className="text-[15px] leading-[1.5]">{fix.text}</div>
      </div>
    </div>
  );
}
