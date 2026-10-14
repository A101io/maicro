import { getI18n } from "@/lib/i18n";
import { Chip, Dot, Scene, type Tone } from "./Scene";

/** One dot per sample: SCAN_DEFAULTS.monthly asks each question 10 times (docs/CRITERIA.md, Meetmethode). */
const ASKS = 10;

/**
 * The same question asked ten times of each assistant (14s). The first
 * round says all is well; only the count shows the error that keeps coming
 * back.
 */
export async function ControleViz() {
  const { copy } = await getI18n();
  const S = copy.landing.scenes.controle;
  return (
    <Scene seconds={14} label={S.label} caption={S.caption}>
      <div className="sc-bubble" data-show="0.02">
        {S.ask}
      </div>
      <div className="sc-stack sc-phase">
        <Chip tone="green" data-show="0.08-0.3">
          {S.once}
        </Chip>
        <Chip tone="blue" data-show="0.32">
          {S.many}
        </Chip>
      </div>
      <div className="sc-runs">
        {S.rows.map((r, row) => (
          <div key={r.engine} className="sc-run">
            <strong className="sc-run-name">{r.engine}</strong>
            <div className="sc-run-dots">
              {Array.from({ length: ASKS }, (_, j) => {
                const wrong = (r.wrong as readonly number[]).includes(j);
                const at = j === 0 ? "0.08" : (0.3 + j * 0.017).toFixed(3);
                return <Dot key={j} tone={wrong ? "red" : "green"} data-show={at} {...(j === 0 ? { "data-pulse": "0.1" } : {})} />;
              })}
            </div>
            <span className="sc-run-result" data-show={(0.66 + row * 0.04).toFixed(2)}>
              <Chip tone={r.tone as Tone}>{r.result}</Chip>
            </span>
          </div>
        ))}
      </div>
      <p className="sc-verdict" data-show="0.8">
        {S.verdict}
      </p>
    </Scene>
  );
}
