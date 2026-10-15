import { getI18n } from "@/lib/i18n";
import { Chip, Scene } from "./Scene";

/** Month (0-based) in which each change happens. */
function eventMonths(events: readonly { month: number }[]) {
  return new Set(events.map((e) => e.month));
}

/**
 * One year, three changes, two ways of looking after it (14s). Set right
 * once: wrong from the first change on. Checked monthly: each change wrong
 * for one month.
 */
export async function DriftViz() {
  const { copy } = await getI18n();
  const S = copy.landing.scenes.drift;
  const changes = eventMonths(S.events);
  const first = Math.min(...changes);
  const at = (m: number) => (0.06 + m * 0.045).toFixed(3);
  const lanes = [
    { ...S.once, wrong: (m: number) => m >= first, tone: "red" as const },
    { ...S.monthly, wrong: (m: number) => changes.has(m), tone: "amber" as const },
  ];
  return (
    <Scene seconds={14} label={S.label} caption={S.caption}>
      <div className="sc-year">
        <span />
        {S.months.map((m, i) => (
          <span key={m} className={`sc-month ${changes.has(i) ? "is-change" : ""}`}>
            {m}
          </span>
        ))}
        {lanes.map((l, row) => (
          <div key={l.label} className="sc-lane">
            <strong className="sc-lane-name">{l.label}</strong>
            {S.months.map((m, i) => (
              <i key={m} className={`sc-cell-m ${l.wrong(i) ? "is-red" : "is-green"}`} data-show={at(i)} />
            ))}
            <span className="sc-lane-result" data-show={(0.62 + row * 0.05).toFixed(2)}>
              <Chip tone={l.tone}>{l.result}</Chip>
            </span>
          </div>
        ))}
      </div>
      <ol className="sc-events">
        {S.events.map((e) => (
          <li key={e.text} data-show={at(e.month)}>
            <span className="sc-event-month">{S.months[e.month]}</span>
            {e.text}
          </li>
        ))}
      </ol>
    </Scene>
  );
}
