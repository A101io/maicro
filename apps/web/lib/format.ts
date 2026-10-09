const MONTHS_NL = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const MONTHS_NL_LONG = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

function parts(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const p = new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return { day: get("day"), month: Number(get("month")), year: get("year"), hour: get("hour"), minute: get("minute") };
}

/** "7 okt 2026" */
export function dateShort(iso: string | Date): string {
  const p = parts(iso);
  return `${p.day} ${MONTHS_NL[p.month - 1]} ${p.year}`;
}

/** "7 oktober 2026" */
export function dateLong(iso: string | Date): string {
  const p = parts(iso);
  return `${p.day} ${MONTHS_NL_LONG[p.month - 1]} ${p.year}`;
}

/** "7 okt 2026 14:32" */
export function dateTime(iso: string | Date): string {
  const p = parts(iso);
  return `${p.day} ${MONTHS_NL[p.month - 1]} ${p.year} ${p.hour}:${p.minute}`;
}

/** "7 okt" */
export function dayMonth(iso: string | Date): string {
  const p = parts(iso);
  return `${p.day} ${MONTHS_NL[p.month - 1]}`;
}

export function addDays(iso: string | Date, days: number): Date {
  const d = typeof iso === "string" ? new Date(iso) : new Date(iso.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

export function hostOf(url: string | null | undefined): string {
  if (!url) return "";
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

/** "7 oktober 2026, 14:32" */
export function dateTimeLong(iso: string | Date): string {
  const p = parts(iso);
  return `${p.day} ${MONTHS_NL_LONG[p.month - 1]} ${p.year}, ${p.hour}:${p.minute}`;
}
