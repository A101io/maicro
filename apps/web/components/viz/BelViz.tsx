import { getI18n } from "@/lib/i18n";
import { Chip, Vidalo, Scene } from "./Scene";

const MISSED = 8;

function Phone() {
  return (
    <svg className="sc-phone" viewBox="0 0 24 24" aria-hidden>
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z" />
    </svg>
  );
}

/**
 * A stale phone number in three directories (14s): every customer who asks
 * the AI gets a dead line, and the count goes up until Vidalo fixes the
 * directories and the call goes through.
 */
export async function BelViz() {
  const { copy } = await getI18n();
  const S = copy.landing.scenes.bel;
  return (
    <Scene seconds={14} label={S.label} caption={S.caption}>
      <div className="sc-cols">
        <div className="sc-col">
          <div className="sc-bubble" data-show="0.02">
            {S.ask}
          </div>
          <div className="sc-card">
            <div className="sc-card-head">{S.engine}</div>
            <div className="sc-stack sc-answer">
              <span className="sc-bad" data-show="0.07-0.58">
                {S.wrong}
              </span>
              <span className="sc-good" data-show="0.62">
                {S.right}
              </span>
            </div>
          </div>
          <div className="sc-card sc-call">
            <Phone />
            <div className="sc-stack">
              <span className="sc-meta sc-ringing" data-show="0.12-0.2">
                {S.calling}
              </span>
              <span className="sc-bad" data-show="0.21-0.58">
                {S.dead}
              </span>
              <span className="sc-good" data-show="0.68">
                {S.connected}
              </span>
            </div>
          </div>
          <div className="sc-card">
            <span className="sc-card-head">{S.missed}</span>
            <div className="sc-marks">
              {Array.from({ length: MISSED }, (_, i) => (
                <i key={i} data-show={(0.22 + i * 0.032).toFixed(3)} />
              ))}
            </div>
            <div className="sc-stack sc-meta">
              <span data-show="0.24-0.58">{S.missedOn}</span>
              <span data-show="0.62">{S.missedOff}</span>
            </div>
          </div>
        </div>
        <div className="sc-col">
          <span className="sc-label">{S.sourcesTitle}</span>
          <ul className="sc-list">
            {S.sources.map((s, i) => (
              <li key={s.name} className="sc-row">
                <span className="sc-name">{s.name}</span>
                {s.stale ? (
                  <span className="sc-stack">
                    <Chip tone="red" data-show={`0-${(0.52 + i * 0.03).toFixed(2)}`}>
                      {S.wrong}
                    </Chip>
                    <Chip tone="green" data-show={(0.53 + i * 0.03).toFixed(2)}>
                      {S.right}
                    </Chip>
                  </span>
                ) : (
                  <Chip tone="green">{S.right}</Chip>
                )}
              </li>
            ))}
          </ul>
          <Vidalo text={S.maicro} data-show="0.46" data-pulse="0.47" />
        </div>
      </div>
    </Scene>
  );
}
