import { copyFor, PRICES } from "@maicro/core/copy";
import { localizeHref } from "@/lib/lang-paths";
import { SITE } from "@/lib/seo";

/**
 * /llms.txt (llmstxt.org): what Maicro is, in plain Markdown, for AI
 * assistants that read it. Maicro publishes one for every customer's facts
 * page; this is its own. Built from the same copy as the pages, so the two
 * cannot disagree.
 */
export const dynamic = "force-static";

export function GET() {
  const nl = copyFor("nl");
  const en = copyFor("en");
  const u = (route: string, lang: "nl" | "en") => SITE + (localizeHref(route, lang) === "/" ? "" : localizeHref(route, lang));
  const steps = nl.landing.werkt.steps.map((s) => `- **${s.title}**: ${s.body}`).join("\n");
  const faq = nl.landing.vragen.items.map((it) => `- **${it.q}** ${it.a}`).join("\n");
  const body = `# Maicro

> ${nl.pages.home.description}

${nl.tagline} Maicro is een dienst van A101 B.V. (Rotterdam, KvK 42057858) voor Nederlandse bedrijven. English: ${en.pages.home.description}

## Wat Maicro doet
${steps}

## Prijs
- ${nl.landing.prijs.setup.name}: €${PRICES.setupEur} eenmalig, excl. btw. De eerste controle is gratis.
- ${nl.landing.prijs.monitor.name}: €${PRICES.monitorEurPerMonth} per maand, excl. btw, maandelijks opzegbaar.

## Pagina's
- [${nl.pages.home.title}](${u("/", "nl")}): gratis controle
- [${nl.pages.how.title}](${u("/hoe-het-werkt", "nl")})
- [${nl.pages.why.title}](${u("/waarom", "nl")})
- [${nl.pages.next.title}](${u("/straks", "nl")})
- [Prijs](${u("/prijzen", "nl")})
- [Voorbeeldrapport](${u("/r/voorbeeld", "nl")})
- English: [${en.pages.home.title}](${u("/", "en")}), [${en.pages.how.title}](${u("/hoe-het-werkt", "en")}), [${en.pages.next.title}](${u("/straks", "en")})

## Veelgestelde vragen
${faq}

## Contact
hallo@maicro.nl
`;
  return new Response(body, { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
