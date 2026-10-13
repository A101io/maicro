import { getI18n } from "@/lib/i18n";
import { Chip, Maicro, Scene, Tick, type Tone } from "./Scene";

/**
 * An AI assistant orders for a customer and skips the business a stale
 * directory calls closed (16s). Then Maicro fixes the directory and the same
 * order goes to that business.
 */
export async function RegelViz() {
  const { copy } = await getI18n();
  const S = copy.landing.scenes.regel;
  return (
    <Scene seconds={16} label={S.label} caption={S.caption}>
      <div className="sc-stack sc-phase">
        <Chip tone="red" data-show="0-0.54">
          {S.phaseWrong}
        </Chip>
        <Chip tone="green" data-show="0.62">
          {S.phaseRight}
        </Chip>
      </div>
      <div className="sc-cols">
        <div className="sc-col">
          <div className="sc-bubble" data-show="0.02">
            {S.ask}
          </div>
          <div className="sc-card">
            <div className="sc-card-head">{S.engine}</div>
            <ol className="sc-log">
              <li data-show="0.08">
                <Tick />
                {S.steps[0]}
              </li>
              <li data-show="0.15">
                <Tick />
                {S.steps[1]}
              </li>
              <li className="sc-stack">
                <span data-show="0.3-0.54">
                  <Tick />
                  {S.orderWrong}
                </span>
                <span data-show="0.74">
                  <Tick />
                  {S.orderRight}
                </span>
              </li>
            </ol>
          </div>
        </div>
        <div className="sc-col">
          <ul className="sc-list">
            <li className="sc-row sc-row-you" data-show="0.1">
              <span className="sc-name">{S.you.name}</span>
              <span className="sc-stack">
                <Chip tone="red" data-show="0.17-0.58">
                  {S.you.wrong}
                </Chip>
                <Chip tone="green" data-show="0.6">
                  {S.you.right}
                </Chip>
              </span>
              <span className="sc-strike" data-show="0.24-0.54" />
            </li>
            {S.others.map((o, i) => (
              <li key={o.name} className="sc-row" data-show={String(0.11 + i * 0.01)}>
                <span className="sc-name">{o.name}</span>
                <Chip tone={o.tone as Tone} data-show={String(0.17 + i * 0.01)}>
                  {o.status}
                </Chip>
              </li>
            ))}
          </ul>
          <div className="sc-stack">
            <div className="sc-card sc-receipt" data-show="0.32-0.54">
              <span className="sc-card-head">{S.receipt}</span>
              <strong>{S.others[0]!.name}</strong>
              <span className="sc-meta">{S.item}</span>
              <span className="sc-bad">{S.lost}</span>
            </div>
            <Maicro text={S.maicro} data-show="0.55-0.72" data-pulse="0.56" />
            <div className="sc-card sc-receipt is-good" data-show="0.78">
              <span className="sc-card-head">{S.receipt}</span>
              <strong>{S.you.name}</strong>
              <span className="sc-meta">{S.item}</span>
              <span className="sc-good">{S.won}</span>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}
