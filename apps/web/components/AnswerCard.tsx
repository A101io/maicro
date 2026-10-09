/**
 * One quoted answer: italic grey question, the answer line with one highlighted
 * span (red tint for a wrong value, grey tint for a not-found quote, bold for
 * "names others"), caption "n van 3 keer".
 */
export function AnswerCard({ question, engine, before = "", highlight, highlightTone = "rood", after = "", caption }: { question: string; engine: string; before?: string; highlight: string; highlightTone?: "rood" | "grijs" | "bold"; after?: string; caption: string }) {
  const mark = highlightTone === "rood" ? "mark-wrong" : highlightTone === "grijs" ? "mark-grey" : "font-bold";
  return (
    <div className="card flex flex-col gap-2.5 p-5 sm:p-[22px]">
      <p className="text-[15px] italic text-muted">{question}</p>
      <p className="text-[17px] leading-[1.4]">
        {engine}
        {before ? ` ${before} ` : ": "}
        <span className={mark}>{highlight}</span>
        {after ? ` ${after}` : ""}
      </p>
      <p className="text-[13px] text-muted">{caption}</p>
    </div>
  );
}
