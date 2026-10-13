import { getI18n } from "@/lib/i18n";

/**
 * The Vidalo mark: a dot with one straight corner at the bottom left,
 * rounded at ten percent of its width. Blue unless a status colour is given
 * (report headers take the colour of the result).
 */
export function Mark({ size = 18, color = "var(--blue)", className = "" }: { size?: number; color?: string; className?: string }) {
  const corner = Math.round(size * 0.1);
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{ display: "inline-block", width: size, height: size, flex: "none", background: color, borderRadius: `999px 999px 999px ${corner}px` }}
    />
  );
}

/**
 * Mark + wordmark, standing on one baseline. `size` is the wordmark's font
 * size; the mark is three quarters of it and sits on the baseline.
 */
export async function Logo({ size = 24, color }: { size?: number; color?: string }) {
  const { copy } = await getI18n();
  const mark = Math.round(size * 0.75);
  return (
    <span role="img" aria-label={copy.brand} className="inline-flex items-end" style={{ gap: Math.round(size * 0.25) }}>
      <Mark size={mark} color={color} className="mb-[0.125em]" />
      <span className="font-extrabold leading-none" style={{ fontSize: size, letterSpacing: "-0.02em" }}>
        {copy.nav.wordmark}
      </span>
    </span>
  );
}
