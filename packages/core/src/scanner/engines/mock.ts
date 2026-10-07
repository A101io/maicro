/**
 * Deterministic mock engine. Produces plausible Dutch answers from the
 * business facts and, for ~35% of (prompt, engine) pairs, injects one wrong
 * value: an old phone number, "gesloten op zondag", "permanent gesloten", a
 * service "nee" where the facts say yes, etc. Some wrong answers cite a fake
 * directory page (openingstijden.nl/{slug}, telefoonboek.nl/{slug}); some
 * cite nothing (model memory).
 *
 * A business without a website, or whose slug contains "nieuw" or "onbekend",
 * is one the mock AI has barely heard of: ~70% of its samples answer
 * "Ik kan geen informatie vinden over {name} in {place}." (no citations).
 *
 * Everything is seeded by business slug + prompt + engine + sampleIndex, so
 * the same inputs always give the same answer across runs and processes.
 */
import type { Engine, FactKey, Facts, Hours } from "../../types";
import { DAY_NAMES_NL, formatPhoneNl, normalizePhone, slugify } from "../normalize";
import { seededRandom } from "../util";
import type { EngineClient, AskContext, EngineAnswer } from "./types";

const WRONG_PAIR_RATE = 0.35; // share of (prompt, engine) pairs that carry a wrong value
const WRONG_SAMPLE_RATE = 0.8; // within such a pair, share of samples that repeat it
const OTHER_ENTITY_RATE = 0.04;
/** For a business the mock "has never heard of": share of samples that say not found. */
const NOT_FOUND_SAMPLE_RATE = 0.7;

/** A business without a website, or whose slug says "nieuw" / "onbekend", is one the mock AI barely knows. */
export function mockIsUnknownBusiness(slug: string, facts: Pick<Facts, "website">): boolean {
  return facts.website == null || /nieuw|onbekend/.test(slug);
}

const OTHER_CITIES = ["Amsterdam", "Rotterdam", "Utrecht", "Eindhoven", "Groningen", "Leiden", "Zwolle", "Breda"];

/** Infer category + probe from the prompt text when no Prompt object is passed. */
function inferProbe(promptNl: string): { category: FactKey; probe: string } {
  const p = promptNl.toLowerCase();
  const dayIdx = DAY_NAMES_NL.findIndex((d) => p.includes(d));
  if (p.includes("telefoon")) return { category: "phone", probe: "phone" };
  if (p.includes("adres")) return { category: "address", probe: "address" };
  if (p.includes("website")) return { category: "website", probe: "website" };
  if (p.includes("pinnen")) return { category: "payment", probe: "payment:pin" };
  if (p.includes("wat kost")) return { category: "price", probe: `price:${promptNl.match(/wat kost (.+?) bij/i)?.[1] ?? ""}` };
  if (p.includes("geldt bij")) return { category: "policy", probe: `policy:${promptNl.match(/"(.+?)"/)?.[1] ?? ""}` };
  if (p.startsWith("doet ")) return { category: "service", probe: `service:${promptNl.match(/ook (.+?)\?/i)?.[1] ?? ""}` };
  if (p.includes("openingstijden")) return { category: "hours", probe: "hours" };
  if (dayIdx >= 0 || p.includes("hoe laat") || p.includes("tot hoe laat")) return { category: "hours", probe: `hours.${dayIdx >= 0 ? dayIdx : 5}` };
  return { category: "existence", probe: "existence" };
}

const hoursText = (h: Hours | undefined, day: number) =>
  !h || h.closed || !h.open || !h.close ? `op ${DAY_NAMES_NL[day]} gesloten` : `op ${DAY_NAMES_NL[day]} open van ${h.open} tot ${h.close}`;

/** A different-but-plausible phone number with the same area code. */
function oldPhone(phone: string, rng: () => number): string {
  const norm = normalizePhone(phone) ?? "+31231234567";
  const digits = norm.slice(3);
  const area = digits.slice(0, 2);
  let rest = "";
  for (let i = 0; i < 7; i++) rest += String(Math.floor(rng() * 10));
  return formatPhoneNl(`+31${area}${rest}`);
}

interface Composed {
  text: string;
  /** Short description of the injected error, for debugging only. */
  injected?: string;
}

/** Build the answer for one probe; `wrong` flips the fact. */
function compose(category: FactKey, probe: string, facts: Facts, wrong: boolean, rng: () => number, engine: Engine): Composed {
  const { name, place } = facts;
  const subject = probe.includes(":") ? probe.slice(probe.indexOf(":") + 1) : probe.includes(".") ? probe.slice(probe.indexOf(".") + 1) : null;
  const intro = engine === "google_ai" ? "" : rng() < 0.5 ? `${name} in ${place}: ` : "";

  switch (category) {
    case "existence": {
      if (wrong) {
        return facts.openStatus === "permanently_closed"
          ? { text: `${intro}Ja, ${name} in ${place} is gewoon open en ontvangt klanten.`, injected: "open" }
          : { text: `${name} in ${place} is permanent gesloten. De zaak lijkt niet meer actief te zijn.`, injected: "permanently_closed" };
      }
      if (facts.openStatus === "permanently_closed") return { text: `${name} in ${place} is definitief gesloten.` };
      if (facts.openStatus === "temporarily_closed") return { text: `${name} in ${place} is tijdelijk gesloten.` };
      return { text: `${intro}Ja, ${name} in ${place} is nog gewoon open. Je kunt er terecht tijdens de openingstijden.` };
    }
    case "hours": {
      if (subject == null) {
        // General opening-hours prompt: list every day the facts know about.
        const lines = facts.hours.map((h) => {
          const flip = wrong && h.day === 6;
          return flip ? `op ${DAY_NAMES_NL[6]} gesloten` : hoursText(h, h.day);
        });
        return { text: `De openingstijden van ${name} in ${place} zijn: ${lines.join(", ")}.`, injected: wrong ? "hours.6=closed" : undefined };
      }
      const day = Number(subject);
      const h = facts.hours.find((x) => x.day === day);
      if (!wrong) return { text: `${intro}${name} is ${hoursText(h, day)}.` };
      if (!h || h.closed) return { text: `${intro}${name} is op ${DAY_NAMES_NL[day]} open van 10:00 tot 16:00.`, injected: "10:00-16:00" };
      if (rng() < 0.6) return { text: `${name} in ${place} is op ${DAY_NAMES_NL[day]} gesloten.`, injected: "closed" };
      return { text: `${intro}${name} is op ${DAY_NAMES_NL[day]} open van 09:00 tot 17:00.`, injected: "09:00-17:00" };
    }
    case "phone": {
      const phone = facts.phone ? formatPhoneNl(normalizePhone(facts.phone) ?? facts.phone) : null;
      if (!phone) return { text: `Ik kon geen telefoonnummer vinden van ${name} in ${place}.` };
      if (wrong) return { text: `Het telefoonnummer van ${name} in ${place} is ${oldPhone(phone, rng)}.`, injected: "old phone" };
      return { text: `${intro}Je bereikt ${name} op ${phone}.` };
    }
    case "address": {
      const addr = facts.address ?? `Hoofdstraat 1`;
      const pc = facts.postcode ? ` ${facts.postcode}` : "";
      if (wrong) {
        const bumped = addr.replace(/(\d+)/, (m) => String(Number(m) + 2 + Math.floor(rng() * 20)));
        return { text: `${name} zit op ${bumped},${pc} ${place}.`, injected: "wrong house number" };
      }
      return { text: `${intro}Het adres is ${addr},${pc} ${place}.` };
    }
    case "website": {
      const site = facts.website ?? `https://www.${slugify(name)}.nl`;
      if (wrong) return { text: `De website van ${name} is https://www.${slugify(name)}-${slugify(place)}.com.`, injected: "wrong domain" };
      return { text: `${intro}De website van ${name} is ${site}.` };
    }
    case "service": {
      const s = subject ?? "";
      const yes = facts.servicesYes.some((x) => x.toLowerCase() === s.toLowerCase());
      const says = wrong ? !yes : yes;
      return says
        ? { text: `Ja, ${name} in ${place} doet ook ${s}. Neem contact op voor de mogelijkheden.`, injected: wrong ? "service yes" : undefined }
        : { text: `Nee, ${name} in ${place} biedt geen ${s} aan.`, injected: wrong ? "service no" : undefined };
    }
    case "price": {
      const p = facts.prices.find((x) => x.label.toLowerCase() === (subject ?? "").toLowerCase());
      if (!p) return { text: `Ik kon geen prijs vinden voor ${subject} bij ${name}.` };
      const amount = wrong ? Math.round(p.amount * 1.25 * 100) / 100 : p.amount;
      return { text: `${subject} kost bij ${name} in ${place} € ${amount.toFixed(2).replace(".", ",")}${p.unit ? ` ${p.unit}` : ""}.`, injected: wrong ? "price" : undefined };
    }
    case "policy": {
      return wrong
        ? { text: `Nee, dat geldt niet bij ${name} in ${place}.`, injected: "policy no" }
        : { text: `Ja, bij ${name} in ${place} geldt: ${subject}.` };
    }
    case "payment": {
      return wrong
        ? { text: `Nee, bij ${name} in ${place} kun je alleen contant betalen.`, injected: "payment no" }
        : { text: `Ja, bij ${name} in ${place} kun je gewoon pinnen.` };
    }
  }
}

function minimalFacts(ctx: AskContext): Facts {
  return (
    ctx.facts ?? {
      businessId: ctx.business.id,
      version: 0,
      verifiedAt: null,
      provisional: true,
      name: ctx.business.name,
      place: ctx.business.place,
      address: null,
      postcode: null,
      phone: null,
      email: null,
      website: ctx.business.domain ? `https://${ctx.business.domain}` : null,
      openStatus: "open",
      hours: [],
      servicesYes: [],
      servicesNo: [],
      prices: [],
      policies: [],
      paymentMethods: [],
      notConfusedWith: [],
    }
  );
}

export interface MockEngineOptions {
  /** Share of (prompt, engine) pairs that carry a wrong value (default 0.35; 0 = always correct). */
  wrongPairRate?: number;
  otherEntityRate?: number;
}

export function createMockEngine(engine: Engine, options: MockEngineOptions = {}): EngineClient {
  const wrongPairRate = options.wrongPairRate ?? WRONG_PAIR_RATE;
  const otherEntityRate = options.otherEntityRate ?? OTHER_ENTITY_RATE;
  return {
    engine,
    available: () => true,
    async ask(promptNl: string, ctx: AskContext): Promise<EngineAnswer> {
      const facts = minimalFacts(ctx);
      const slug = ctx.business.slug || slugify(ctx.business.name, ctx.business.place);
      const sampleIndex = ctx.sampleIndex ?? 0;
      // A prompt probing several fields (the general opening-hours question) gets the general answer.
      const { category, probe } = ctx.prompt
        ? { category: ctx.prompt.category, probe: ctx.prompt.probes.length === 1 ? ctx.prompt.probes[0]! : ctx.prompt.category }
        : inferProbe(promptNl);

      // Seeds use the slug (stable across processes; MemDb ids are fresh UUIDs per run).
      const seedBase = `${slug}|${promptNl}|${engine}`;
      // Pair-level decisions (same for every sample of this prompt+engine).
      const pairRng = seededRandom(seedBase);
      const wrongPair = pairRng() < wrongPairRate;
      const citeRoll = pairRng();
      const otherEntityPair = !wrongPair && pairRng() < otherEntityRate;
      const otherCity = OTHER_CITIES[Math.floor(pairRng() * OTHER_CITIES.length)]!;

      // Sample-level decisions.
      const rng = seededRandom(`${seedBase}|${sampleIndex}`);
      if (mockIsUnknownBusiness(slug, facts)) {
        const nfRng = seededRandom(`${seedBase}|${sampleIndex}|notfound`);
        if (nfRng() < NOT_FOUND_SAMPLE_RATE) {
          return { answerText: `Ik kan geen informatie vinden over ${facts.name} in ${facts.place}.`, citations: [], costCents: 0 };
        }
      }
      const wrong = wrongPair && rng() < WRONG_SAMPLE_RATE;

      let { text } = compose(category, probe, facts, wrong, rng, engine);
      if (otherEntityPair) {
        text = text.replaceAll(` in ${facts.place}`, ` in ${otherCity}`) + ` (Let op: dit gaat over ${facts.name} in ${otherCity}.)`;
      }

      const site = facts.website ?? (ctx.business.domain ? `https://${ctx.business.domain}` : null);
      const citations: string[] = [];
      if (wrong) {
        if (citeRoll < 0.35) citations.push(`https://openingstijden.nl/${slug}`);
        else if (citeRoll < 0.6) citations.push(`https://www.telefoonboek.nl/${slug}`);
        else if (citeRoll < 0.75 && site) citations.push(`${site.replace(/\/$/, "")}/contact`);
        // else: no citation -> model memory
      } else if (citeRoll < 0.5 && site) {
        citations.push(site);
      } else if (citeRoll < 0.65) {
        citations.push(`https://www.google.com/maps/place/${encodeURIComponent(`${facts.name} ${facts.place}`)}`);
      }
      return { answerText: text, citations, costCents: 0 };
    },
  };
}
