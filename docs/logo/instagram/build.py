#!/usr/bin/env python3
"""
Builds the Instagram pages: `python3 docs/logo/instagram/build.py`.

Two families, every theme in every colour:

  stories/vraag-<thema>-<kleur>.html   the chat field that becomes the logo
                                       (docs/logo/animaties.html, card 7), 1080 x 1920
  hero/hero-<formaat>-<thema>-<kleur>.html
                                       the landing hero's visual (apps/web/components/HeroViz.tsx),
                                       story 1080 x 1920, post 1080 x 1350, vierkant 1080 x 1080

Themes are sectors with their own questions, sources and answers; colours are
the ground the scene sits on. Every page is one loop (10 s for the chat field,
12 s for the hero) and shrinks to fit the window for previewing; at the real
size (set it in the browser's device toolbar) it is 1:1 for recording.
"""
from pathlib import Path

HERE = Path(__file__).parent
FONT = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">'
TAGLINE = ("Je klanten vragen het aan ChatGPT.", "Wij zorgen dat het antwoord klopt.")

# ---------------------------------------------------------------- themes
THEMES = {
    "bakker": {
        "questions": ["Is de bakker op zondag open?", "Wat kost een brood?", "Bezorgen ze ook in Haarlem?"],
        "hero": {
            "question": "Is Bakkerij De Vries op zondag open?",
            "wrong": "Ja, zondag van 9:00 tot 17:00.",
            "right": "Nee, op zondag gesloten.",
            "sources": [("Eigen website", "zondag gesloten"), ("Google-profiel", "zondag gesloten"),
                        ("openingstijden.nl", "zondag 9–17 · uit 2022", "bijgewerkt: gesloten"), ("Krantenbericht", "naamgenoot, Heemstede")],
        },
    },
    "kapper": {
        "questions": ["Is de kapper op maandag open?", "Wat kost een knipbeurt?", "Kan ik zonder afspraak komen?"],
        "hero": {
            "question": "Wat kost knippen bij Kapsalon Mila?",
            "wrong": "Knippen kost 22 euro.",
            "right": "Knippen kost 34 euro.",
            "sources": [("Eigen website", "knippen 34 euro"), ("Google-profiel", "knippen 34 euro"),
                        ("kapperstarieven.nl", "knippen 22 euro · uit 2021", "bijgewerkt: 34 euro"), ("Krantenbericht", "naamgenoot, Leiden")],
        },
    },
    "garage": {
        "questions": ["Doet de garage ook APK?", "Wat kost een APK?", "Is er een leenauto?"],
        "hero": {
            "question": "Doet Garage Jansen APK-keuringen?",
            "wrong": "Nee, alleen onderhoud.",
            "right": "Ja, APK zonder afspraak.",
            "sources": [("Eigen website", "APK zonder afspraak"), ("Google-profiel", "APK zonder afspraak"),
                        ("garagegids.nl", "alleen onderhoud · uit 2020", "bijgewerkt: ook APK"), ("Krantenbericht", "naamgenoot, Delft")],
        },
    },
    "restaurant": {
        "questions": ["Is het restaurant op maandag open?", "Kan ik reserveren voor acht?", "Hebben ze een terras?"],
        "hero": {
            "question": "Is Restaurant Fleur op maandag open?",
            "wrong": "Ja, maandag vanaf 17:00.",
            "right": "Nee, op maandag gesloten.",
            "sources": [("Eigen website", "maandag gesloten"), ("Google-profiel", "maandag gesloten"),
                        ("restaurantgids.nl", "ma–zo 17–23 · uit 2022", "bijgewerkt: maandag dicht"), ("Krantenbericht", "naamgenoot, Utrecht")],
        },
    },
}

# ------------------------------------------------------------- colours
# ground, headline, sub line, site line; for the chat field: field, field text, name
COLOURS = {
    "wit":    dict(bg="#FFFFFF", ink="#111827", sub="#374151", site="#2563EB", field="#2563EB", field_fg="#FFFFFF", name="#111827", viz_panel="#F4F1EC"),
    "creme":  dict(bg="#F4F1EC", ink="#111827", sub="#374151", site="#2563EB", field="#2563EB", field_fg="#FFFFFF", name="#111827", viz_panel="#FFFFFF"),
    "donker": dict(bg="#0F172A", ink="#FFFFFF", sub="#CBD5E1", site="#60A5FA", field="#2563EB", field_fg="#FFFFFF", name="#FFFFFF", viz_panel="#F4F1EC"),
    "blauw":  dict(bg="#2563EB", ink="#FFFFFF", sub="#DBEAFE", site="#FFFFFF", field="#FFFFFF", field_fg="#2563EB", name="#FFFFFF", viz_panel="#FFFFFF"),
}

FORMATS = {"story": (1080, 1920), "post": (1080, 1350), "vierkant": (1080, 1080)}

FIT = """<script>
// Preview: shrink the page to fit the window. At the real size this is 1.
(function(){function fit(){var s=document.querySelector('.page');s.style.zoom=Math.min(1,innerWidth/%d,innerHeight/%d);}fit();addEventListener('resize',fit);})();
</script>"""


def shell(title, w, h, c, body, extra_css="", extra_js=""):
    return f"""<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width={w}">
<title>{title}</title>
<!-- Built by docs/logo/instagram/build.py. {w} x {h}, one loop. Record it in Chrome with the device toolbar at {w} x {h}. -->
{FONT}
<style>
html,body{{margin:0;background:#E7E3DC}}
.page{{position:relative;width:{w}px;height:{h}px;margin:0 auto;overflow:hidden;background:{c['bg']};color:{c['ink']};font-family:'Plus Jakarta Sans',system-ui,sans-serif;--t:1}}
.copy{{position:absolute;left:96px;right:96px;font-weight:800;line-height:1.2;letter-spacing:-1.5px;color:{c['ink']}}}
.copy span{{display:block;margin-top:0.45em;font-weight:500;line-height:1.35;letter-spacing:0;color:{c['sub']}}}
.site{{position:absolute;left:96px;font-size:38px;font-weight:600;color:{c['site']}}}
{extra_css}
</style>
</head>
<body>
<div class="page">
{body}
</div>
{extra_js}
{FIT % (w, h)}
</body>
</html>
"""


# ------------------------------------------------------- the chat field
SLOTS = [(4, 16, 23, 25), (26, 38, 45, 47), (48, 60, 67, 69)]
OPEN = "min-width:180px;width:calc(var(--fw) + 49px);padding:0 22px;border-radius:999px 999px 999px 7px"
CLOSED = "min-width:60px;width:60px;padding:0;border-radius:999px 999px 999px 7px"


def field_css(questions, c):
    kf = [f"0%{{transform:scale(0);transform-origin:0% 100%;opacity:1;--fw:0px;{OPEN}}}",
          "2.2%{transform:scale(1.1);transform-origin:0% 100%}",
          f"3.5%{{transform:scale(1);transform-origin:0% 100%;opacity:1;--fw:0px;{OPEN}}}",
          "10%{transform:scale(1);transform-origin:50% 50%}"]
    q = ""
    for i, (text, (a, b, cc, d)) in enumerate(zip(questions, SLOTS), 1):
        n = len(text)
        kf += [f"{a}%{{--fw:0px;animation-timing-function:steps({n},end)}}", f"{b}%{{--fw:var(--w{i})}}", f"{d}%{{--fw:var(--w{i})}}", f"{d+1}%{{--fw:0px}}"]
        pre = f"0%,{a-1}%{{max-width:0;opacity:0}}" if i > 1 else "0%{max-width:0;opacity:0}"
        q += (f"@keyframes vd-q{i}{{{pre}{a}%{{max-width:0;opacity:1;animation-timing-function:steps({n},end)}}"
              f"{b}%{{max-width:var(--w);opacity:1}}{cc}%{{max-width:var(--w);opacity:1}}{d}%{{max-width:var(--w);opacity:0}}{d+1}%,100%{{max-width:0;opacity:0}}}}\n"
              f".a7-q{i}{{animation:vd-q{i} calc(10s * var(--t)) linear infinite}}\n")
    kf[-1] = f"69%{{transform:scale(1);opacity:1;--fw:var(--w3);{OPEN}}}"  # the last question's box closes straight away
    kf += [f"78%{{--fw:0px;{CLOSED}}}", f"80%{{{CLOSED}}}", f"83%{{{CLOSED}}}",
           f"89%{{transform:scale(1) rotate(0deg) translateY(0);{CLOSED}}}",
           f"92%{{transform:scale(1) rotate(-12deg) translateY(-4px);{CLOSED}}}",
           f"96%{{transform:scale(1) rotate(0deg) translateY(0);{CLOSED}}}",
           f"97%{{opacity:1;{CLOSED}}}", f"100%{{opacity:0;transform-origin:50% 50%;{CLOSED}}}"]
    return f"""@property --fw{{syntax:'<length>';inherits:false;initial-value:0px}}
@keyframes vd-field{{
  {chr(10).join('  ' + k for k in kf).strip()}
}}
{q}@keyframes vd-caret-on{{0%{{visibility:hidden}}3%{{visibility:visible}}69%{{visibility:hidden}}100%{{visibility:hidden}}}}
@keyframes vd-blink{{0%,100%{{opacity:1}}50%{{opacity:0}}}}
@keyframes vd-name7{{0%,83%{{max-width:0;opacity:1;animation-timing-function:steps(6,end)}}89%{{max-width:var(--w);opacity:1}}97%{{max-width:var(--w);opacity:1}}100%{{max-width:var(--w);opacity:0}}}}
@keyframes vd-caret2-on{{0%{{visibility:hidden}}81%{{visibility:visible}}95%{{visibility:hidden}}100%{{visibility:hidden}}}}
.a7-field{{animation:vd-field calc(10s * var(--t)) cubic-bezier(.22,.7,.2,1) infinite}}
.a7-caret{{animation:vd-caret-on calc(10s * var(--t)) steps(1,end) infinite, vd-blink calc(1s * var(--t)) steps(1,end) infinite}}
.a7-name{{animation:vd-name7 calc(10s * var(--t)) cubic-bezier(.22,.7,.2,1) infinite}}
.a7-caret2{{animation:vd-caret2-on calc(10s * var(--t)) steps(1,end) infinite, vd-blink calc(.9s * var(--t)) steps(1,end) infinite}}
.scene{{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%) scale(1.55);transform-origin:50% 50%;width:760px;display:flex;justify-content:center}}
.copy{{top:1240px;font-size:60px}} .copy span{{font-size:40px}} .site{{bottom:168px}}
@media (prefers-reduced-motion: reduce){{
  .a7-field,.a7-q1,.a7-q2,.a7-q3,.a7-caret,.a7-name,.a7-caret2{{animation:none}}
  .a7-field{{min-width:0;width:60px;padding:0;border-radius:999px 999px 999px 7px}}
  .a7-q1,.a7-q2,.a7-q3,.a7-caret,.a7-caret2{{display:none}}
  .a7-name{{max-width:none}}
}}"""


FIELD_JS = """<script>
// The typed questions and the name stop at their real width, measured from an unanimated copy once the font is in.
(function () {
  function widthOf(el) {
    var c = el.cloneNode(true); c.className = '';
    c.style.cssText = el.style.cssText + ';position:absolute;visibility:hidden;max-width:none;animation:none';
    el.parentNode.appendChild(c);
    var w = c.scrollWidth; c.remove();
    return Math.ceil(w + 1) + (el.classList.contains('a7-q') ? 4 : 6);
  }
  function measure() {
    var field = document.querySelector('.a7-field');
    document.querySelectorAll('.a7-q, .a7-name').forEach(function (el) { el.style.setProperty('--w', widthOf(el) + 'px'); });
    document.querySelectorAll('.a7-q').forEach(function (el, i) { field.style.setProperty('--w' + (i + 1), el.style.getPropertyValue('--w')); });
  }
  measure(); addEventListener('load', measure);
  if (document.fonts) { document.fonts.load("500 22px 'Plus Jakarta Sans'"); document.fonts.load("800 84px 'Plus Jakarta Sans'"); document.fonts.ready.then(measure); document.fonts.addEventListener('loadingdone', measure); }
  setTimeout(measure, 1500); setTimeout(measure, 4000);
})();
</script>"""


def field_body(questions, c):
    qs = "\n".join(f'          <span class="a7-q a7-q{i}" style="grid-area: 1 / 1; display: inline-block; overflow: hidden; white-space: nowrap; max-width: 0">{q}</span>' for i, q in enumerate(questions, 1))
    return f"""  <div class="scene">
    <div style="display: flex; align-items: flex-end; gap: 16px" role="img" aria-label="Een chatveld waarin klantvragen worden getypt, dat het Vidalo logo wordt">
      <span class="a7-field" style="transform-origin: 0% 100%; display: flex; align-items: center; box-sizing: border-box; min-width: 180px; width: calc(var(--fw) + 49px); height: 60px; padding: 0 22px; border: 1.5px solid {c['field']}; border-radius: 999px 999px 999px 7px; background: {c['field']}; margin-bottom: 9px; overflow: hidden; white-space: nowrap">
        <span style="display: inline-grid; font-size: 22px; font-weight: 500; line-height: 1.4; color: {c['field_fg']}">
{qs}
        </span>
        <span class="a7-caret" style="display: inline-block; flex: none; width: 2px; height: 24px; background: {c['field_fg']}; margin-left: 3px"></span>
      </span>
      <span class="a7-name" style="display: inline-block; overflow: hidden; white-space: nowrap; padding: 0.12em 0 0.16em 0; margin-bottom: -0.16em; font-weight: 800; font-size: 84px; line-height: 1; letter-spacing: -3px; color: {c['name']}; max-width: 0">vidalo</span>
      <span class="a7-caret2" style="display: inline-block; flex: none; width: 5px; height: 64px; background: {c['field']}; margin: 0 0 14px -12px"></span>
    </div>
  </div>
  <div class="copy">{TAGLINE[0]}<span>{TAGLINE[1]}</span></div>
  <div class="site">vidalo.io</div>"""


# ------------------------------------------------------------ the hero
W, H = 560, 480
SOURCE_Y = [118, 203, 288, 373]
SOURCE_RIGHT = 200
CARD = (252, 245)
BAD = 2
RED, GREEN, GREY, BLUE = "#E11D48", "#2F855A", "#9CA3AF", "#2563EB"

HERO_CSS = """
.viz, .viz *{box-sizing:border-box}
.viz{position:relative;aspect-ratio:560/480;container-type:inline-size;overflow:hidden;border-radius:2.2cqw;
  background:radial-gradient(circle at 1px 1px, rgb(17 24 39 / 0.07) 1px, transparent 0) 0 0 / 22px 22px, var(--viz-panel);
  font-size:2.45cqw;line-height:1.3;color:#111827}
.viz-svg,.viz-stage{position:absolute;inset:0;width:100%;height:100%}
.viz-stage>*{position:absolute}
.viz-q{background:#111827;color:#fff;font-weight:600;padding:.75em 1em;border-radius:1.1em 1.1em .3em 1.1em}
.viz-src{height:12.5%;display:flex;flex-direction:column;justify-content:center;gap:.15em;padding:0 .85em;background:#fff;border:1.5px solid #e7e3dc;border-radius:.9em}
.viz-src-name{font-weight:700}
.viz-src-meta,.viz-swap>*{font-size:.86em;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.viz-src-bad{border-color:#86efac;background:#f0fdf4}
.viz-swap{display:grid}.viz-swap>*{grid-area:1/1}
.viz-before{opacity:0;color:#b91c1c}.viz-after{color:#166534;font-weight:600}
.viz-card{background:#fff;border:1.5px solid #e7e3dc;border-radius:1.1em;padding:.85em 1em 1em;box-shadow:0 18px 40px -28px rgb(17 24 39 / .45)}
.viz-card-head{display:flex;align-items:center;justify-content:space-between;font-size:.86em;font-weight:700;color:#6b7280}
.viz-stip{width:.95em;height:.95em;border-radius:9999px;background:#2f855a}
.viz-answer{display:grid;align-items:center;min-height:2.8em;margin-top:.35em;font-size:1.12em;font-weight:700}
.viz-answer>*{grid-area:1/1}
.viz-typing,.viz-wrong{opacity:0}
.viz-typing{display:inline-flex;gap:.3em}.viz-typing i{width:.45em;height:.45em;border-radius:9999px;background:#9ca3af}
.viz-wrong{color:#e11d48}.viz-right{color:#166534}
.viz-vidalo{display:flex;align-items:center;gap:.75em;padding:.6em .9em;background:#fff;border:1.5px solid #2563eb;border-radius:9999px;font-size:.92em}
.viz-vidalo-mark{font-weight:800;letter-spacing:-.02em;color:#2563eb}
.viz-swap-3>*{color:#111827;font-size:1em;opacity:0}.viz-swap-3>:last-child{opacity:1}
.viz-repair{stroke-dasharray:none}
@media (prefers-reduced-motion: reduce){.viz-particles{display:none}.viz-bad-line{stroke:#2f855a}}
@media (prefers-reduced-motion: no-preference){
  .viz-repair{stroke-dasharray:1}
  .viz-svg,.viz-stage{animation:viz-cycle 12s linear infinite}
  .viz-q{animation:viz-q 12s cubic-bezier(.22,.7,.2,1) infinite}
  .viz-typing{animation:viz-typing 12s linear infinite}
  .viz-typing i{animation:viz-blink .9s ease-in-out infinite}
  .viz-typing i:nth-child(2){animation-delay:.15s}.viz-typing i:nth-child(3){animation-delay:.3s}
  .viz-wrong{animation:viz-wrong 12s cubic-bezier(.22,.7,.2,1) infinite}
  .viz-right{animation:viz-right 12s cubic-bezier(.22,.7,.2,1) infinite}
  .viz-stip{animation:viz-stip 12s linear infinite}
  .viz-src-bad{animation:viz-bad 12s linear infinite}
  .viz-before{animation:viz-before 12s linear infinite}.viz-after{animation:viz-after 12s linear infinite}
  .viz-swap-3>:nth-child(1){animation:viz-m1 12s linear infinite}
  .viz-swap-3>:nth-child(2){animation:viz-m2 12s linear infinite}
  .viz-swap-3>:nth-child(3){animation:viz-m3 12s linear infinite}
  .viz-vidalo{animation:viz-vidalo 12s linear infinite}
  @keyframes viz-cycle{0%{opacity:0}3%{opacity:1}95%{opacity:1}100%{opacity:0}}
  @keyframes viz-q{0%,1%{opacity:0;translate:0 10px}7%,100%{opacity:1;translate:none}}
  @keyframes viz-typing{0%,9%{opacity:0}11%,20%{opacity:1}22%,100%{opacity:0}}
  @keyframes viz-blink{0%,100%{opacity:.3}50%{opacity:1}}
  @keyframes viz-wrong{0%,21%{opacity:0;translate:0 6px}25%,58%{opacity:1;translate:none}62%,100%{opacity:0;translate:0 -6px}}
  @keyframes viz-right{0%,62%{opacity:0;translate:0 6px}67%,100%{opacity:1;translate:none}}
  @keyframes viz-stip{0%,21%{background:#9ca3af;box-shadow:0 0 0 0 rgb(47 133 90 / 0)}24%,62%{background:#e11d48;box-shadow:0 0 0 0 rgb(47 133 90 / 0)}64%{background:#2f855a;box-shadow:0 0 0 0 rgb(47 133 90 / .55)}74%,100%{background:#2f855a;box-shadow:0 0 0 .9em rgb(47 133 90 / 0)}}
  @keyframes viz-bad{0%,54%{border-color:#fca5a5;background:#fef2f2}57%,100%{border-color:#86efac;background:#f0fdf4}}
  @keyframes viz-before{0%,54%{opacity:1}57%,100%{opacity:0}}
  @keyframes viz-after{0%,54%{opacity:0}57%,100%{opacity:1}}
  @keyframes viz-m1{0%,40%{opacity:1}42%,100%{opacity:0}}
  @keyframes viz-m2{0%,41%{opacity:0}43%,57%{opacity:1}59%,100%{opacity:0}}
  @keyframes viz-m3{0%,58%{opacity:0}60%,100%{opacity:1}}
  @keyframes viz-vidalo{0%,40%{box-shadow:0 0 0 0 rgb(37 99 235 / 0)}43%{box-shadow:0 0 0 0 rgb(37 99 235 / .4)}52%,100%{box-shadow:0 0 0 .8em rgb(37 99 235 / 0)}}
}"""


def pct(v, of):
    return f"{v / of * 100:.4f}%"


def line(y):
    return f"M{SOURCE_RIGHT} {y} C {SOURCE_RIGHT + 30} {y}, {CARD[0] - 30} {CARD[1]}, {CARD[0]} {CARD[1]}"


def hero_viz(h):
    repair = f"M262 418 C 228 418, 236 {SOURCE_Y[BAD]}, {SOURCE_RIGHT} {SOURCE_Y[BAD]}"
    svg = [f'<svg class="viz-svg" viewBox="0 0 {W} {H}" aria-hidden="true"><defs>']
    svg += [f'<path id="viz-line-{i}" d="{line(y)}"></path>' for i, y in enumerate(SOURCE_Y)]
    svg.append("</defs>")
    for i, y in enumerate(SOURCE_Y):
        if i == BAD:
            svg.append(f'<path class="viz-bad-line" d="{line(y)}" fill="none" stroke="{RED}" stroke-width="2" stroke-linecap="round"><animate attributeName="stroke" dur="12s" repeatCount="indefinite" values="{RED};{RED};{GREEN};{GREEN}" keyTimes="0;0.54;0.57;1"/></path>')
        else:
            svg.append(f'<path d="{line(y)}" fill="none" stroke="#D1D5DB" stroke-width="1.5" stroke-linecap="round"></path>')
    svg.append(f'<path class="viz-repair" d="{repair}" pathLength="1" fill="none" stroke="{BLUE}" stroke-width="2" stroke-dasharray="1" stroke-linecap="round"><animate attributeName="stroke-dashoffset" dur="12s" repeatCount="indefinite" values="1;1;0;0;1" keyTimes="0;0.42;0.52;0.9;1"/></path>')
    svg.append('<g class="viz-particles">')
    for i in range(4):
        for k in range(3):
            dur = f"{1.6 + i * 0.15:.2f}s"; begin = f"{k * 0.55 + i * 0.2:.2f}s"
            fill = f'<animate attributeName="fill" dur="12s" repeatCount="indefinite" values="{RED};{RED};{GREEN};{GREEN}" keyTimes="0;0.55;0.57;1"/>' if i == BAD else ""
            svg.append(f'<circle r="{4 if i == BAD else 3}" fill="{RED if i == BAD else GREY}"><animateMotion dur="{dur}" begin="{begin}" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href="#viz-line-{i}"/></animateMotion>{fill}<animate attributeName="opacity" dur="{dur}" begin="{begin}" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.15;0.85;1"/></circle>')
    svg.append("</g>")
    svg.append(f'<circle class="viz-particles" cx="{SOURCE_RIGHT}" cy="{SOURCE_Y[BAD]}" r="6" fill="none" stroke="{BLUE}" stroke-width="2" opacity="0"><animate attributeName="r" dur="12s" repeatCount="indefinite" values="6;6;22;22" keyTimes="0;0.52;0.6;1"/><animate attributeName="opacity" dur="12s" repeatCount="indefinite" values="0;0;0.8;0;0" keyTimes="0;0.52;0.53;0.62;1"/></circle></svg>')
    stage = [f'<div class="viz-stage" aria-hidden="true"><div class="viz-q" style="left:{pct(252, W)};top:{pct(28, H)};width:{pct(296, W)}">{h["question"]}</div>']
    for i, s in enumerate(h["sources"]):
        style = f'left:{pct(12, W)};top:{pct(SOURCE_Y[i] - 30, H)};width:{pct(SOURCE_RIGHT - 12, W)}'
        if i == BAD:
            stage.append(f'<div class="viz-src viz-src-bad" style="{style}"><span class="viz-src-name">{s[0]}</span><span class="viz-swap"><span class="viz-before">{s[1]}</span><span class="viz-after">{s[2]}</span></span></div>')
        else:
            stage.append(f'<div class="viz-src" style="{style}"><span class="viz-src-name">{s[0]}</span><span class="viz-src-meta">{s[1]}</span></div>')
    bad_name = h["sources"][BAD][0]
    stage.append(f'<div class="viz-card" style="left:{pct(CARD[0], W)};top:{pct(CARD[1] - 58, H)};width:{pct(296, W)}"><div class="viz-card-head"><span>ChatGPT</span><span class="viz-stip"></span></div><div class="viz-answer"><span class="viz-typing"><i></i><i></i><i></i></span><span class="viz-wrong">{h["wrong"]}</span><span class="viz-right">{h["right"]}</span></div></div>')
    stage.append(f'<div class="viz-vidalo" style="left:{pct(252, W)};top:{pct(392, H)};width:{pct(296, W)}"><span class="viz-vidalo-mark">vidalo</span><span class="viz-swap viz-swap-3"><span>Controleert de bronnen</span><span>Fout gevonden: {bad_name}</span><span>Bron hersteld · antwoord klopt</span></span></div></div>')
    return '<div class="viz" role="img" aria-label="Zo werkt het: een AI bouwt een antwoord uit bronnen. Eén verouderde bron maakte het antwoord fout. Vidalo herstelt die bron en het antwoord klopt weer.">' + "".join(svg) + "".join(stage) + "</div>"


# layout per format: viz width, viz top, copy top, headline size, sub size, site bottom
HERO_LAYOUT = {
    "story":    dict(vw=960, vtop=330, ctop=1290, h1=60, h2=40, sb=168),
    "post":     dict(vw=920, vtop=120, ctop=960, h1=54, h2=36, sb=96),
    "vierkant": dict(vw=700, vtop=72, ctop=720, h1=44, h2=30, sb=64),
}
HERO_COPY = ("Wat zegt AI over jouw bedrijf?", "Eén verouderde bron bepaalt het antwoord. Wij herstellen die bron.")


def build():
    stories = HERE / "stories"; hero = HERE / "hero"
    stories.mkdir(exist_ok=True); hero.mkdir(exist_ok=True)
    rows_s, rows_h = [], []
    for theme, t in THEMES.items():
        for colour, c in COLOURS.items():
            name = f"vraag-{theme}-{colour}.html"
            (stories / name).write_text(shell(f"Vidalo story: {theme}, {colour}", 1080, 1920, c, field_body(t["questions"], c), field_css(t["questions"], c), FIELD_JS), encoding="utf-8")
            rows_s.append((theme, colour, name))
            for fmt, (w, h) in FORMATS.items():
                L = HERO_LAYOUT[fmt]
                css = HERO_CSS + f"\n.page{{--viz-panel:{c['viz_panel']}}}\n.viz{{position:absolute;left:50%;top:{L['vtop']}px;width:{L['vw']}px;translate:-50% 0}}\n.copy{{top:{L['ctop']}px;font-size:{L['h1']}px}} .copy span{{font-size:{L['h2']}px}} .site{{bottom:{L['sb']}px}}"
                body = f"{hero_viz(t['hero'])}\n  <div class=\"copy\">{HERO_COPY[0]}<span>{HERO_COPY[1]}</span></div>\n  <div class=\"site\">vidalo.io</div>"
                hname = f"hero-{fmt}-{theme}-{colour}.html"
                (hero / hname).write_text(shell(f"Vidalo {fmt}: hero, {theme}, {colour}", w, h, c, body, css), encoding="utf-8")
                rows_h.append((fmt, theme, colour, hname))

    li_s = "\n".join(f'<li><a href="stories/{n}">{n}</a></li>' for _, _, n in rows_s)
    li_h = "\n".join(f'<li><a href="hero/{n}">{n}</a></li>' for *_, n in rows_h)
    (HERE / "index.html").write_text(f"""<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><title>Vidalo: Instagram</title>
<style>body{{font-family:'Plus Jakarta Sans',system-ui,sans-serif;max-width:860px;margin:48px auto;padding:0 24px;color:#111827;line-height:1.5}}a{{color:#2563EB}}li{{margin:6px 0}}ul{{columns:2}}h2{{margin-top:40px}}</style></head>
<body><h1>Vidalo: Instagram</h1>
<p>Gemaakt door <code>build.py</code>. Thema's: {", ".join(THEMES)}. Kleuren: {", ".join(COLOURS)}. Elke pagina is één loop en krimpt in het venster; op ware grootte (device toolbar in Chrome) is hij 1:1.</p>
<h2>Stories: het chatveld dat het logo wordt (1080 × 1920, 10 s)</h2>
<ul>{li_s}</ul>
<h2>De hero van de site (story 1080 × 1920, post 1080 × 1350, vierkant 1080 × 1080, 12 s)</h2>
<ul>{li_h}</ul>
<h2>Opnemen</h2>
<ol><li>Open een pagina in Chrome, device toolbar op de maat uit de bestandsnaam (story 1080 × 1920, post 1080 × 1350, vierkant 1080 × 1080).</li>
<li>Neem één loop op met Cmd Shift 5.</li>
<li>Plaats het. Instagram knipt stories af op vijftien seconden; een post mag langer.</li></ol>
</body></html>
""", encoding="utf-8")
    print(f"{len(rows_s)} stories, {len(rows_h)} hero pages, index.html")


if __name__ == "__main__":
    build()
