/**
 * The frame every looping scene shares (RegelViz, BelViz, ...).
 *
 * Timing lives in data attributes, read by public/motion.js, which plays the
 * scene as one loop while it is on screen and starts it from the top each
 * time it scrolls in. All times are fractions of the loop:
 *
 *   data-show="0.3"       appears at 30% and stays
 *   data-show="0.3-0.55"  appears at 30%, leaves at 55%
 *   data-draw="0.5-0.66"  grows from the left between 50% and 66%
 *   data-pulse="0.56"     a blue ring goes out from it at 56%
 *
 * Without the script, and under reduced motion, a scene shows its end state:
 * everything that only belongs to the middle of the story ("0.3-0.55") is
 * hidden by CSS, everything else shows. The drawing is aria-hidden; its
 * meaning is in the label on the frame.
 */
export function Scene({ seconds, label, caption, children }: { seconds: number; label: string; caption?: string; children: React.ReactNode }) {
  return (
    <figure className="scene-fig m-0 flex min-w-0 flex-col gap-3">
      <div className="scene" role="img" aria-label={label} data-scene={seconds}>
        <div aria-hidden className="scene-in">
          {children}
        </div>
      </div>
      {caption && <figcaption className="text-[13px] text-muted">{caption}</figcaption>}
    </figure>
  );
}

/** A scene beside its heading and explanation; `flip` puts the scene first on wide screens. */
export function SceneRow({ h3, body, flip, dark, children }: { h3: string; body: string; flip?: boolean; dark?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-center gap-7 lg:grid-cols-12 lg:gap-12">
      <div className={`flex flex-col gap-3 lg:col-span-4 ${flip ? "lg:order-2" : ""}`}>
        <h3 className="text-[22px] font-extrabold leading-[1.2] sm:text-[24px]" style={{ letterSpacing: "-0.5px" }}>
          {h3}
        </h3>
        <p className={`text-[16px] leading-[1.55] ${dark ? "text-dark-text" : "text-ink-2"}`}>{body}</p>
      </div>
      <div className={`min-w-0 lg:col-span-8 ${flip ? "lg:order-1" : ""} ${dark ? "scene-on-dark" : ""}`}>{children}</div>
    </div>
  );
}

export type Tone = "red" | "green" | "grey" | "amber" | "blue";

export function Chip({ tone, children, ...rest }: { tone: Tone; children: React.ReactNode } & React.HTMLAttributes<HTMLSpanElement> & Record<`data-${string}`, string>) {
  return (
    <span className={`sc-chip is-${tone}`} {...rest}>
      <i className="sc-dot" />
      {children}
    </span>
  );
}

export function Dot({ tone, ...rest }: { tone: Tone } & Record<`data-${string}`, string>) {
  return <i className={`sc-dot is-${tone}`} {...rest} />;
}

export function Tick() {
  return (
    <svg className="sc-tick" viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="8" />
      <path d="M4.5 8.2 7 10.6l4.6-5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Vidalo({ text, ...rest }: { text: string } & Record<`data-${string}`, string>) {
  return (
    <div className="sc-vidalo" {...rest}>
      <span className="sc-vidalo-mark">vidalo</span>
      <span>{text}</span>
    </div>
  );
}
