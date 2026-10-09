export type SourceStatusTone = "groen" | "rood" | "muted";

const toneClass: Record<SourceStatusTone, string> = {
  groen: "font-semibold text-groen",
  rood: "font-semibold text-rood",
  muted: "text-muted",
};

/** Grey panel row: source label left, status right (klopt / ontbreekt / niet geclaimd / neutral text). */
export function SourceRow({ label, status, tone = "muted", href }: { label: string; status: string; tone?: SourceStatusTone; href?: string | null }) {
  return (
    <div className="row-grey">
      <span className="min-w-0 break-words">
        {href ? (
          <a href={href} target="_blank" rel="nofollow noopener" className="underline-offset-2 hover:underline">
            {label}
          </a>
        ) : (
          label
        )}
      </span>
      <span className={`shrink-0 text-right text-[14px] sm:text-[15px] ${toneClass[tone]}`}>{status}</span>
    </div>
  );
}
