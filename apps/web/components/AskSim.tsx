import { copy } from "@maicro/core/copy";

/**
 * "Vraag het zelf": a simulated conversation with an AI assistant. A visitor
 * picks a customer's question and watches the answer arrive, with the wrong
 * part marked; then what is wrong, where it came from, what it costs and what
 * Maicro does; and the same answer after the fix.
 *
 * Server-rendered, so it reads fine without script: the first case shows,
 * complete. public/ask.js adds the playback (typing, marking, the rows one by
 * one) and the switches. It starts after the page has loaded, so React has
 * long finished hydrating before it touches anything.
 */
export function AskSim() {
  const A = copy.landing.ask;
  return (
    <div className="ask" data-ask>
      <div className="ask-picks" role="group" aria-label={A.pick}>
        {A.cases.map((c, i) => (
          <button key={c.topic} type="button" className="ask-pick" data-ask-pick={i} aria-pressed={i === 0}>
            <span className={`ask-topic is-${c.tone}`}>{c.topic}</span>
            <span className="ask-q">{c.question}</span>
          </button>
        ))}
      </div>

      <div className="ask-stage">
        <div className="ask-bar">
          <span className="ask-engine">
            <i />
            {A.engine}
          </span>
          <span className="ask-views ask-js" role="group">
            <button type="button" data-ask-view="before" aria-pressed="true">
              {A.before}
            </button>
            <button type="button" data-ask-view="after" aria-pressed="false">
              {A.after}
            </button>
          </span>
        </div>

        {A.cases.map((c, i) => (
          <div key={c.topic} className="ask-case" data-ask-case={i} hidden={i !== 0}>
            <div className="ask-chat" aria-live="polite">
              <div className="ask-msg ask-user" data-step="1">
                <span className="ask-who">{A.you}</span>
                {c.question}
              </div>
              <div className="ask-typing" data-step="2" aria-hidden>
                <i />
                <i />
                <i />
                <span>{A.typing}</span>
              </div>
              <div className="ask-msg ask-ai" data-step="3">
                <span className="ask-who">{A.engine}</span>
                <p className="ask-before" data-ask-type>
                  {c.answer[0]}
                  <mark className={`ask-mark is-${c.tone}`}>{c.answer[1]}</mark>
                  {c.answer[2]}
                </p>
                <p className="ask-after">
                  <mark className="ask-mark is-green">{c.fixed}</mark>
                </p>
                <div className="ask-sources">
                  <span>{A.sourcesLabel}:</span>
                  {c.sources.map((s) => (
                    <span key={s} className="ask-src">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <dl className="ask-result">
              <div data-step="4">
                <dt>{A.rows.verdict}</dt>
                <dd>
                  <span className="ask-before">
                    <i className={`ask-dot is-${c.tone}`} />
                    <strong>{c.tone === "grey" ? A.verdictMissing : A.verdictWrong}.</strong> {c.wrong}
                  </span>
                  <span className="ask-after">
                    <i className="ask-dot is-green" />
                    <strong>{A.verdictRight}.</strong>
                  </span>
                </dd>
              </div>
              <div data-step="5">
                <dt>{A.rows.source}</dt>
                <dd>
                  <span className="ask-before">{c.source}</span>
                  <span className="ask-after">{A.sourceAfter}</span>
                </dd>
              </div>
              <div data-step="6">
                <dt>{A.rows.cost}</dt>
                <dd>
                  <span className="ask-before ask-cost">{c.cost}</span>
                  <span className="ask-after">{A.costAfter}</span>
                </dd>
              </div>
              <div data-step="7">
                <dt>{A.rows.fix}</dt>
                <dd>{c.fix}</dd>
              </div>
            </dl>
          </div>
        ))}
        <button type="button" className="ask-replay ask-js" data-ask-replay>
          {A.replay}
        </button>
      </div>
    </div>
  );
}
