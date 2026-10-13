/**
 * Playback for the "Vraag het zelf" simulator (components/AskSim.tsx).
 *
 * Starts once React has hydrated the simulator (see start()); from then on
 * it only toggles classes, `hidden` and aria-pressed on markup React never
 * re-renders. Without this file the first case simply shows, complete.
 * Reduced motion: every step appears at once, no typing.
 */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function init(root) {
    const picks = [...root.querySelectorAll("[data-ask-pick]")];
    const cases = [...root.querySelectorAll("[data-ask-case]")];
    const views = [...root.querySelectorAll("[data-ask-view]")];
    const replay = root.querySelector("[data-ask-replay]");
    let active = 0;
    let timers = [];

    // Words become spans once, so the answer can be typed out.
    for (const p of root.querySelectorAll("[data-ask-type]")) {
      const walk = (node) => {
        for (const child of [...node.childNodes]) {
          if (child.nodeType === 3) {
            const frag = document.createDocumentFragment();
            for (const part of child.textContent.split(/(\s+)/)) {
              if (!part) continue;
              if (/^\s+$/.test(part)) frag.append(part);
              else {
                const w = document.createElement("span");
                w.className = "ask-w";
                w.textContent = part;
                frag.append(w);
              }
            }
            child.replaceWith(frag);
          } else walk(child);
        }
      };
      walk(p);
    }

    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };
    const at = (ms, fn) => timers.push(setTimeout(fn, reduce ? 0 : ms));

    function setView(view) {
      root.classList.toggle("is-after", view === "after");
      views.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.askView === view)));
    }

    function play(i) {
      clear();
      active = i;
      setView("before");
      root.classList.remove("is-done");
      picks.forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
      cases.forEach((c, j) => (c.hidden = j !== i));
      const c = cases[i];
      const step = (n) => c.querySelectorAll(`[data-step="${n}"]`);
      for (const s of c.querySelectorAll("[data-step]")) s.classList.add("is-waiting");
      c.querySelector('[data-step="2"]').classList.remove("is-gone");
      const words = [...c.querySelectorAll(".ask-w")];
      words.forEach((w) => w.classList.add("is-waiting"));
      c.querySelectorAll(".ask-mark").forEach((m) => m.classList.remove("is-marked"));

      at(120, () => step(1).forEach((s) => s.classList.remove("is-waiting")));
      at(650, () => step(2).forEach((s) => s.classList.remove("is-waiting")));
      const typeAt = 1900;
      at(typeAt, () => {
        step(2).forEach((s) => s.classList.add("is-gone"));
        step(3).forEach((s) => s.classList.remove("is-waiting"));
      });
      words.forEach((w, k) => at(typeAt + 60 + k * 45, () => w.classList.remove("is-waiting")));
      const typed = typeAt + 60 + words.length * 45;
      at(typed + 200, () => c.querySelectorAll(".ask-before .ask-mark, .ask-before.ask-mark").forEach((m) => m.classList.add("is-marked")));
      [4, 5, 6, 7].forEach((n, k) => at(typed + 650 + k * 420, () => step(n).forEach((s) => s.classList.remove("is-waiting"))));
      at(typed + 650 + 4 * 420, () => root.classList.add("is-done"));
    }

    function showAfter() {
      clear();
      const c = cases[active];
      for (const s of c.querySelectorAll("[data-step]")) s.classList.remove("is-waiting");
      c.querySelectorAll(".ask-w").forEach((w) => w.classList.remove("is-waiting"));
      c.querySelector('[data-step="2"]').classList.add("is-gone");
      setView("after");
      root.classList.add("is-done");
      c.querySelectorAll(".ask-after .ask-mark").forEach((m) => {
        m.classList.remove("is-marked");
        setTimeout(() => m.classList.add("is-marked"), reduce ? 0 : 60);
      });
    }

    picks.forEach((b, i) => b.addEventListener("click", () => play(i)));
    views.forEach((b) =>
      b.addEventListener("click", () => {
        if (b.dataset.askView === "after") showAfter();
        else play(active);
      }),
    );
    replay?.addEventListener("click", () => play(active));

    root.classList.add("is-ready");
    // The first case plays when the simulator scrolls into view.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          play(0);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(root);
  }

  // Never touch the simulator while React may still hydrate it: a changed
  // text node makes React throw the server HTML away and rebuild the whole
  // page (which also drops motion.js's animations). On the app, wait until
  // React has claimed the node; on the static copy there is no React at all.
  const hasReact = () => !!document.querySelector('script[src*="/_next/"]');
  const hydrated = (el) => Object.keys(el).some((k) => k.startsWith("__reactFiber"));
  function start(tries = 0) {
    const roots = [...document.querySelectorAll("[data-ask]")];
    if (hasReact() && roots.some((r) => !hydrated(r)) && tries < 200) return setTimeout(() => start(tries + 1), 50);
    roots.forEach(init);
  }
  if (document.readyState === "complete") start();
  else window.addEventListener("load", () => start());
})();
