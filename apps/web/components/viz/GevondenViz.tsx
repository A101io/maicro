import { getI18n } from "@/lib/i18n";
import { Dot, Scene } from "./Scene";

/**
 * Not found is an answer too (14s): the assistant names three others and the
 * customer calls the first. After a facts page and the directories, the
 * recheck names the business.
 */
export async function GevondenViz() {
  const { copy } = await getI18n();
  const S = copy.landing.scenes.gevonden;
  return (
    <Scene seconds={14} label={S.label} caption={S.caption}>
      <div className="sc-bubble" data-show="0.02">
        {S.ask}
      </div>
      <div className="sc-card">
        <div className="sc-card-head">{S.engine}</div>
        <div className="sc-stack">
          <div className="sc-ranked" data-show="0.08-0.48">
            <ol>
              {S.before.map((n, i) => (
                <li key={n} data-show={(0.09 + i * 0.02).toFixed(2)} className={i === 0 ? "sc-picked" : undefined}>
                  {n}
                </li>
              ))}
            </ol>
            <div className="sc-ghost" data-show="0.17">
              <Dot tone="grey" />
              <span>{S.you}</span>
              <span className="sc-meta">{S.missing}</span>
            </div>
            <span className="sc-bad" data-show="0.23">
              {S.consequence}
            </span>
          </div>
          <div className="sc-ranked" data-show="0.72">
            <ol>
              {S.after.map((n) => (
                <li key={n} className={n === S.you ? "sc-you" : undefined}>
                  {n === S.you ? (
                    <>
                      <span className="sc-you-name">
                        <Dot tone="green" data-pulse="0.74" />
                        {n}
                      </span>
                      <span className="sc-meta">{S.found}</span>
                    </>
                  ) : (
                    n
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <div className="sc-steps">
        <span className="sc-steps-line">
          <span data-draw="0.5-0.68" />
        </span>
        {S.steps.map((s, i) => (
          <div key={s.day} className="sc-step" data-show={(0.5 + i * 0.09).toFixed(2)}>
            <Dot tone={i === 0 ? "grey" : i === 1 ? "blue" : "green"} />
            <strong>{s.day}</strong>
            <span className="sc-meta">{s.text}</span>
          </div>
        ))}
      </div>
    </Scene>
  );
}
