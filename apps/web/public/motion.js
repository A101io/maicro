/**
 * Scroll motion for the landing page and its static copy (GitHub Pages).
 *
 * Why a script: CSS scroll-driven animations (animation-timeline: view())
 * do nothing in Firefox, so most of the page sat still there.
 *
 * How it stays safe:
 * - It only uses the Web Animations API. It never adds classes, attributes
 *   or nodes, so it cannot disturb React's hydration.
 * - Nothing is hidden by CSS. An element below the fold is put in its
 *   starting pose by a paused animation, and played when it scrolls in. If
 *   this file never loads, every element simply shows.
 * - Reduced motion: it does nothing at all.
 *
 * Markup hints (data-motion on a container):
 *   rise      the element itself rises in
 *   stagger   its children rise in one after another
 *   timeline  its children slide in from the left, their dot popping after
 *   bars      its children grow from the left, like bars being drawn
 *   draw      the element draws itself from the left (a connector line)
 *   pop       the element scales in
 * And on a number: data-count="45" data-suffix="%" counts up (CSS counter;
 * the real text stays in the page for screen readers).
 */
(() => {
  if (!("animate" in Element.prototype) || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const EASE = "cubic-bezier(0.22, 0.7, 0.2, 1)";
  const RISE = [{ opacity: 0, translate: "0 28px" }, { opacity: 1, translate: "0 0" }];
  const RISE_SM = [{ opacity: 0, translate: "0 14px" }, { opacity: 1, translate: "0 0" }];
  const SLIDE = [{ opacity: 0, translate: "-20px 0" }, { opacity: 1, translate: "0 0" }];
  const GROW_X = [{ scale: "0 1" }, { scale: "1 1" }];
  const POP = [{ opacity: 0, scale: "0.6" }, { opacity: 1, scale: "1" }];

  /** Every animation that waits for its element to scroll in, by element. */
  const waiting = new Map();

  function prepare(trigger, el, keyframes, opts) {
    const anim = el.animate(keyframes, { duration: 700, easing: EASE, fill: "both", ...opts });
    anim.pause();
    anim.currentTime = 0;
    if (!waiting.has(trigger)) waiting.set(trigger, []);
    waiting.get(trigger).push(anim);
  }

  function belowFold(el) {
    return el.getBoundingClientRect().top > window.innerHeight * 0.92;
  }

  const main = document.querySelector("main");
  if (!main) return;
  const hero = main.querySelector("section");

  // 1. Every heading and lead paragraph outside the hero rises in.
  for (const el of main.querySelectorAll("section h2, section .lead, section h2 + p")) {
    if (hero && hero.contains(el)) continue;
    if (el.closest("[data-motion]")) continue;
    if (belowFold(el)) prepare(el, el, el.tagName === "H2" ? RISE : RISE_SM, { duration: 800 });
  }

  // 2. Containers that say how they move.
  for (const box of main.querySelectorAll("[data-motion]")) {
    if (!belowFold(box)) continue;
    const kind = box.dataset.motion;
    const kids = [...box.children];
    if (kind === "rise") prepare(box, box, RISE, { duration: 850 });
    if (kind === "pop") prepare(box, box, POP, { duration: 650, easing: "cubic-bezier(0.3, 1.4, 0.5, 1)" });
    if (kind === "draw") {
      box.style.transformOrigin = "left center";
      prepare(box, box, GROW_X, { duration: 600, delay: 250 });
    }
    if (kind === "stagger") {
      kids.forEach((k, i) => {
        prepare(box, k, RISE_SM, { duration: 650, delay: Math.min(i, 10) * 85 });
        // A numbered or coloured badge inside a card pops a moment later.
        for (const badge of k.querySelectorAll("[data-pop]")) {
          prepare(box, badge, POP, { duration: 550, delay: Math.min(i, 10) * 85 + 260, easing: "cubic-bezier(0.3, 1.5, 0.5, 1)" });
        }
      });
    }
    if (kind === "timeline") {
      kids.forEach((k, i) => {
        prepare(box, k, SLIDE, { duration: 600, delay: i * 140 });
        const dot = k.querySelector("[data-stip]");
        if (dot) prepare(box, dot, POP, { duration: 500, delay: i * 140 + 220, easing: "cubic-bezier(0.3, 1.6, 0.5, 1)" });
      });
    }
    if (kind === "bars") {
      kids.forEach((k, i) => {
        k.style.transformOrigin = "left center";
        prepare(box, k, GROW_X, { duration: 700, delay: 200 + i * 90 });
      });
    }
  }

  // 3. Numbers that count up.
  for (const el of main.querySelectorAll("[data-count]")) {
    if (!belowFold(el)) continue;
    const to = Number(el.dataset.count);
    const text = el.querySelector(".count-text");
    if (!Number.isFinite(to) || !text) continue;
    const duration = 1300;
    const opts = { duration, easing: "cubic-bezier(0.25, 0.8, 0.25, 1)", delay: 150 };
    prepare(el, el, [{ "--n": 0 }, { "--n": to }], { ...opts, fill: "none" });
    // While counting, the counter shows and the real text waits underneath;
    // at the end both return to rest, which is the real text.
    prepare(el, text, [{ opacity: 0 }, { opacity: 0 }], { ...opts, fill: "backwards" });
    prepare(el, el, [{ opacity: 1 }, { opacity: 1 }], { ...opts, pseudoElement: "::before", fill: "backwards" });
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        for (const a of waiting.get(e.target) ?? []) a.play();
        waiting.delete(e.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
  );
  for (const el of waiting.keys()) io.observe(el);
})();
