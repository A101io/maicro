/**
 * Sector packs (docs/CRITERIA.md "Sectoren"): per sector the decisive facts,
 * the typical source of the error, the biggest risk, and 6 to 10 extra
 * questions on top of the base prompts, at least two of which ask for a
 * recommendation ("loodgieter met spoed in Zwolle").
 *
 * Every prompt names the criterium it feeds and its kind. A recommendation
 * prompt is judged on one thing: is the business named. Not being named is a
 * finding on the linked criterium, never a ranking.
 */
import type { CriteriumId, FactKey, Facts, Prompt, PromptKind, SectorSlug } from "../types";
import { SECTOR_SLUGS } from "../types";

export type SectorPromptTemplate = Omit<Prompt, "id" | "businessId"> & { criterium: CriteriumId; kind: PromptKind };

export interface SectorPack {
  slug: SectorSlug;
  labelNl: string;
  /** Google Places types and Dutch category words that map to this sector (lowercase, substring match). */
  googleCategories: string[];
  /** KvK SBI code prefixes. */
  sbiCodes: string[];
  /** Three short Dutch lines: the facts that decide for this sector. */
  decisiveFacts: [string, string, string];
  typicalSource: string;
  biggestRisk: string;
  /** Criterium ids that matter most, in order. */
  decisiveCriteria: CriteriumId[];
  /** The noun a customer uses when asking for a recommendation ("loodgieter", "kapper"). */
  nouns: { match: RegExp; noun: string }[];
  defaultNoun: string;
  prompts(facts: Facts): SectorPromptTemplate[];
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

interface Ctx {
  name: string;
  place: string;
  x: string; // "Naam in Plaats"
  noun: string;
  yes: string[];
  no: string[];
  areaPlace: string | null;
  urgency: boolean | null;
  cred: string | null;
  policies: string[];
  sundayOpen: boolean;
  saturdayOpen: boolean;
  firstPrice: string | null;
}

const about = (category: FactKey, criterium: CriteriumId, textNl: string, probes: string[]): SectorPromptTemplate => ({ category, criterium, kind: "about", textNl, probes, active: true });
const rec = (category: FactKey, criterium: CriteriumId, textNl: string, probes: string[]): SectorPromptTemplate => ({ category, criterium, kind: "recommendation", textNl, probes, active: true });

function ctxFor(facts: Facts, pack: Pick<SectorPack, "nouns" | "defaultNoun">): Ctx {
  const noun = pack.nouns.find((n) => n.match.test(facts.name))?.noun ?? pack.defaultNoun;
  const open = (day: number) => {
    const h = facts.hours.find((x) => x.day === day);
    return !!h && !h.closed && !!h.open && !!h.close;
  };
  return {
    name: facts.name,
    place: facts.place,
    x: `${facts.name} in ${facts.place}`,
    noun,
    yes: facts.servicesYes,
    no: facts.servicesNo,
    areaPlace: facts.serviceArea?.places.find((p) => p.toLowerCase() !== facts.place.toLowerCase()) ?? null,
    urgency: facts.urgency ? facts.urgency.available : null,
    cred: facts.credentials?.[0] ?? null,
    policies: facts.policies,
    sundayOpen: open(6),
    saturdayOpen: open(5),
    firstPrice: facts.prices[0]?.label ?? null,
  };
}

const policyMatching = (c: Ctx, re: RegExp) => c.policies.find((p) => re.test(p)) ?? null;

/** Shared building blocks so each pack stays short. */
const block = {
  area: (c: Ctx) => (c.areaPlace ? [about("area", 4, `Komt ${c.x} ook in ${c.areaPlace}?`, [`area:${c.areaPlace}`])] : []),
  areaRec: (c: Ctx) => (c.areaPlace ? [rec("area", 4, `Welke ${c.noun} komt in ${c.areaPlace}?`, [`area:${c.areaPlace}`])] : []),
  urgency: (c: Ctx, text: string) => (c.urgency != null ? [about("urgency", 5, text, ["urgency"])] : []),
  urgencyRec: (c: Ctx, text: string) => (c.urgency ? [rec("urgency", 5, text, ["urgency"])] : []),
  serviceYes: (c: Ctx, i: number, build: (s: string) => string) => (c.yes[i] ? [about("service", 6, build(c.yes[i]!), [`service:${c.yes[i]}`])] : []),
  serviceNo: (c: Ctx, i: number, build: (s: string) => string) => (c.no[i] ? [about("service", 7, build(c.no[i]!), [`service:${c.no[i]}`])] : []),
  serviceRec: (c: Ctx, i: number, build: (s: string) => string) => (c.yes[i] ? [rec("service", 6, build(c.yes[i]!), [`service:${c.yes[i]}`])] : []),
  cred: (c: Ctx, build: (s: string) => string) => (c.cred ? [about("credential", 12, build(c.cred), [`credential:${c.cred}`])] : []),
  credRec: (c: Ctx, build: (s: string) => string) => (c.cred ? [rec("credential", 12, build(c.cred), [`credential:${c.cred}`])] : []),
  policy: (c: Ctx, re: RegExp, build: (p: string) => string) => {
    const p = policyMatching(c, re);
    return p ? [about("policy", 10, build(p), [`policy:${p}`])] : [];
  },
  policyRec: (c: Ctx, re: RegExp, build: (p: string) => string) => {
    const p = policyMatching(c, re);
    return p ? [rec("policy", 10, build(p), [`policy:${p}`])] : [];
  },
  price: (c: Ctx, build: (label: string) => string) => (c.firstPrice ? [about("price", 9, build(c.firstPrice), [`price:${c.firstPrice}`])] : []),
  sundayRec: (c: Ctx) => (c.sundayOpen ? [rec("hours", 3, `Welke ${c.noun} in ${c.place} is op zondag open?`, ["hours.6"])] : []),
  saturdayRec: (c: Ctx) => (c.saturdayOpen ? [rec("hours", 3, `Welke ${c.noun} in ${c.place} is op zaterdag open?`, ["hours.5"])] : []),
  identity: (facts: Facts, c: Ctx) => (facts.notConfusedWith[0] ? [about("identity", 11, `Is ${c.x} hetzelfde bedrijf als ${facts.notConfusedWith[0]}?`, [`identity:${facts.notConfusedWith[0]}`])] : []),
};

/** At least two recommendation prompts: fall back to opening-hours recommendations. */
function ensureRecommendations(list: SectorPromptTemplate[], c: Ctx): SectorPromptTemplate[] {
  const out = [...list];
  const count = () => out.filter((p) => p.kind === "recommendation").length;
  const add = (p: SectorPromptTemplate[]) => {
    for (const x of p) if (count() < 2 && !out.some((y) => y.textNl === x.textNl)) out.push(x);
  };
  if (count() < 2) add(block.saturdayRec(c));
  if (count() < 2) add(block.sundayRec(c));
  if (count() < 2) {
    const weekday = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag"][0]!;
    add([rec("hours", 3, `Welke ${c.noun} in ${c.place} is op ${weekday} open?`, ["hours.0"])]);
  }
  return out;
}

/** Cap at 10, keep every recommendation prompt. */
function cap(list: SectorPromptTemplate[], max = 10): SectorPromptTemplate[] {
  if (list.length <= max) return list;
  const recs = list.filter((p) => p.kind === "recommendation");
  const abouts = list.filter((p) => p.kind === "about");
  return [...abouts.slice(0, Math.max(0, max - recs.length)), ...recs].slice(0, max);
}

function finish(list: SectorPromptTemplate[], c: Ctx): SectorPromptTemplate[] {
  const seen = new Set<string>();
  const unique = list.filter((p) => (seen.has(p.textNl) ? false : (seen.add(p.textNl), true)));
  return cap(ensureRecommendations(unique, c));
}

// ---------------------------------------------------------------------------
// the eleven packs
// ---------------------------------------------------------------------------

export const SECTORS: Record<SectorSlug, SectorPack> = {
  "loodgieters-installateurs": {
    slug: "loodgieters-installateurs",
    labelNl: "Loodgieters en installateurs",
    googleCategories: ["plumber", "electrician", "hvac_contractor", "heating_contractor", "loodgieter", "installateur", "elektricien", "cv-monteur", "installatiebedrijf"],
    sbiCodes: ["4321", "4322"],
    decisiveFacts: ["Werkgebied: in welke plaatsen je komt", "Spoed: of je vandaag of in het weekend kunt komen", "Erkenning: waarvoor je erkend bent"],
    typicalSource: "Gidsen, oude website",
    biggestRisk: "Niet genoemd bij spoedvraag",
    decisiveCriteria: [4, 5, 6, 12],
    nouns: [
      { match: /elektr/i, noun: "elektricien" },
      { match: /cv|verwarming|warmte/i, noun: "cv-monteur" },
      { match: /install/i, noun: "installateur" },
    ],
    defaultNoun: "loodgieter",
    prompts(facts) {
      const c = ctxFor(facts, this);
      return finish(
        [
          ...block.area(c),
          ...block.urgency(c, `Heeft ${c.x} een storingsdienst in het weekend?`),
          ...block.cred(c, (s) => `Is ${c.x} erkend voor ${s}?`),
          ...block.policy(c, /voorrij/i, () => `Rekent ${c.x} voorrijkosten?`),
          ...block.serviceYes(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.urgencyRec(c, `Lekkage, wie kan vandaag komen in ${c.place}?`),
          ...block.urgencyRec(c, `Welke ${c.noun} in ${c.place} heeft een 24-uursdienst?`),
          ...block.serviceRec(c, 0, (s) => `Wie installeert ${s} in ${c.place}?`),
          ...block.areaRec(c),
          ...block.credRec(c, () => `Welke erkende installateurs zitten in ${c.place}?`),
        ],
        c,
      );
    },
  },

  "aannemers-dakdekkers-schilders": {
    slug: "aannemers-dakdekkers-schilders",
    labelNl: "Aannemers, dakdekkers, schilders en hoveniers",
    googleCategories: ["general_contractor", "roofing_contractor", "painter", "landscaper", "aannemer", "dakdekker", "schilder", "hovenier", "stukadoor", "bouwbedrijf", "klusbedrijf"],
    sbiCodes: ["41", "4391", "4334", "4331", "8130", "4399"],
    decisiveFacts: ["Welke klussen je precies doet", "Of een naamgenoot met jou verward wordt", "Wat je rekent en waar je werkt"],
    typicalSource: "Naamgenoot, oud tarief",
    biggestRisk: "Niet op de shortlist",
    decisiveCriteria: [6, 11, 9, 4],
    nouns: [
      { match: /dak/i, noun: "dakdekker" },
      { match: /schilder/i, noun: "schilder" },
      { match: /hoven|tuin/i, noun: "hovenier" },
      { match: /stuk/i, noun: "stukadoor" },
    ],
    defaultNoun: "aannemer",
    prompts(facts) {
      const c = ctxFor(facts, this);
      return finish(
        [
          ...block.serviceYes(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.serviceNo(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.price(c, (l) => `Wat kost ${l} bij ${c.x} ongeveer?`),
          ...block.policy(c, /offerte/i, () => `Kan ik bij ${c.x} een gratis offerte krijgen?`),
          ...block.identity(facts, c),
          ...block.area(c),
          ...block.serviceRec(c, 0, (s) => `Wie doet ${s} in ${c.place}?`),
          ...block.serviceRec(c, 1, (s) => `Welke ${c.noun} in ${c.place} doet ${s}?`),
          ...block.areaRec(c),
          ...block.policyRec(c, /offerte/i, () => `Welke ${c.noun} in ${c.place} geeft een gratis offerte?`),
        ],
        c,
      );
    },
  },

  "vve-beheer": {
    slug: "vve-beheer",
    labelNl: "VvE-beheer en vastgoedbeheer",
    googleCategories: ["property_management_company", "property_management", "vve", "vastgoedbeheer", "vve-beheer", "vve beheer"],
    sbiCodes: ["6832"],
    decisiveFacts: ["Dat je bestaat en wat je doet (financieel, technisch, administratief)", "Wat je rekent per appartement", "Of je ergens bij aangesloten bent"],
    typicalSource: "Nergens vindbaar",
    biggestRisk: "Grijze stip",
    decisiveCriteria: [1, 6, 9, 12, 4],
    nouns: [],
    defaultNoun: "VvE-beheerder",
    prompts(facts) {
      const c = ctxFor(facts, this);
      return finish(
        [
          about("existence", 1, `Welke VvE-beheerder is ${c.x}? Bestaat dat bedrijf?`, ["existence"]),
          ...block.serviceYes(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.serviceYes(c, 1, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.price(c, (l) => `Wat kost ${l} bij ${c.x}?`),
          ...block.cred(c, (s) => `Is ${c.x} aangesloten bij ${s}?`),
          ...block.area(c),
          ...block.identity(facts, c),
          ...block.serviceRec(c, 0, (s) => `Welke VvE-beheerder in ${c.place} doet ook ${s}?`),
          rec("existence", 1, `VvE-beheerder voor 12 appartementen in ${c.place}, wie kan dat doen?`, ["existence"]),
          ...block.areaRec(c),
          ...block.credRec(c, (s) => `Welke VvE-beheerders in ${c.place} zijn aangesloten bij ${s}?`),
        ],
        c,
      );
    },
  },

  "zorg-praktijken": {
    slug: "zorg-praktijken",
    labelNl: "Fysiotherapie, tandarts, huisarts, dierenarts en psycholoog",
    googleCategories: ["physiotherapist", "dentist", "doctor", "veterinary_care", "psychologist", "dental_clinic", "medical_clinic", "fysio", "tandarts", "huisarts", "dierenarts", "psycholoog", "praktijk"],
    sbiCodes: ["8621", "8622", "8623", "8691", "8692", "7500"],
    decisiveFacts: ["Of je nieuwe patiënten aanneemt", "Spoed: of je vandaag nog terecht kunt", "Verwijzing, verzekeraars en registratie"],
    typicalSource: "Oud bericht, gids",
    biggestRisk: "\"Neemt niemand aan\"",
    decisiveCriteria: [1, 5, 10, 12],
    nouns: [
      { match: /fysio/i, noun: "fysio" },
      { match: /tandarts|mondzorg/i, noun: "tandarts" },
      { match: /huisarts/i, noun: "huisarts" },
      { match: /dierenarts|dierenkliniek/i, noun: "dierenarts" },
      { match: /psycho/i, noun: "psycholoog" },
    ],
    defaultNoun: "praktijk",
    prompts(facts) {
      const c = ctxFor(facts, this);
      return finish(
        [
          ...block.serviceYes(c, 0, (s) => `Kan ik bij ${c.x} terecht voor ${s}?`),
          ...block.serviceYes(c, 1, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.urgency(c, `Heeft ${c.x} een spoeddienst?`),
          ...block.policy(c, /verwijz/i, () => `Kan ik bij ${c.x} terecht zonder verwijzing?`),
          ...block.policy(c, /patiënt|patient/i, (p) => `Geldt bij ${c.x}: "${p}"?`),
          ...block.cred(c, (s) => `Heeft ${c.x} een ${s}?`),
          ...block.urgencyRec(c, `Welke ${c.noun} in ${c.place} heeft vanavond een spoeddienst?`),
          ...block.policyRec(c, /verwijz/i, () => `${c.noun.charAt(0).toUpperCase() + c.noun.slice(1)} zonder verwijzing in ${c.place}?`),
          ...block.serviceRec(c, 0, (s) => `Welke ${c.noun} in ${c.place} doet ${s}?`),
          ...block.policyRec(c, /nieuwe patiënt|nieuwe patient/i, () => `Welke ${c.noun} in ${c.place} neemt nieuwe patiënten aan?`),
        ],
        c,
      );
    },
  },

  horeca: {
    slug: "horeca",
    labelNl: "Horeca: restaurants, cafés en lunchrooms",
    googleCategories: ["restaurant", "cafe", "bar", "meal_takeaway", "coffee_shop", "lunchroom", "eetcafe", "eetcafé", "brasserie", "bistro", "pizzeria", "grand café"],
    sbiCodes: ["5610", "5630", "5629"],
    decisiveFacts: ["Openingstijden per dag, ook de keuken", "Reserveren en pinnen", "Terras, groepen en vegetarisch"],
    typicalSource: "Gids 2022, naamgenoot",
    biggestRisk: "\"Gesloten\" terwijl open",
    decisiveCriteria: [3, 1, 10, 6],
    nouns: [
      { match: /caf[eé]/i, noun: "café" },
      { match: /lunch/i, noun: "lunchroom" },
    ],
    defaultNoun: "restaurant",
    prompts(facts) {
      const c = ctxFor(facts, this);
      return finish(
        [
          about("hours", 3, `Is ${c.x} op maandag open?`, ["hours.0"]),
          ...block.policy(c, /reserv/i, () => `Kan ik bij ${c.x} reserveren voor 6 personen?`),
          ...block.serviceYes(c, 0, (s) => `Heeft ${c.x} ${s}?`),
          ...block.serviceYes(c, 1, (s) => `Heeft ${c.x} ook ${s}?`),
          ...block.serviceNo(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.identity(facts, c),
          ...block.sundayRec(c),
          ...block.serviceRec(c, 0, (s) => `Welk ${c.noun} in ${c.place} heeft ${s}?`),
          ...block.policyRec(c, /reserv/i, () => `${c.noun.charAt(0).toUpperCase() + c.noun.slice(1)} in ${c.place} waar ik kan reserveren voor 6?`),
          ...block.saturdayRec(c),
        ],
        c,
      );
    },
  },

  winkels: {
    slug: "winkels",
    labelNl: "Winkels en retail",
    googleCategories: ["store", "bakery", "supermarket", "clothing_store", "florist", "book_store", "shoe_store", "jewelry_store", "pet_store", "hardware_store", "winkel", "bakkerij", "slager", "bloemist", "boekhandel", "drogist", "kledingwinkel"],
    sbiCodes: ["47", "1071"],
    decisiveFacts: ["Koopzondag en feestdagen", "Je adres, ook na een verhuizing", "Wat je verkoopt"],
    typicalSource: "Gidsen na verhuizing",
    biggestRisk: "Bezoek dat niet komt",
    decisiveCriteria: [3, 8, 6],
    nouns: [
      { match: /bakker/i, noun: "bakker" },
      { match: /slager/i, noun: "slager" },
      { match: /bloem/i, noun: "bloemist" },
      { match: /boek/i, noun: "boekhandel" },
      { match: /drogist/i, noun: "drogist" },
    ],
    defaultNoun: "winkel",
    prompts(facts) {
      const c = ctxFor(facts, this);
      return finish(
        [
          about("hours", 3, `Is ${c.x} op koopzondag open?`, ["hours.6"]),
          ...block.serviceYes(c, 0, (s) => `Verkoopt ${c.x} ook ${s}?`),
          ...block.serviceYes(c, 1, (s) => `Heeft ${c.x} ${s}?`),
          ...block.serviceNo(c, 0, (s) => `Kan ik bij ${c.x} ${s}?`),
          ...block.policy(c, /bestel|afhal/i, (p) => `Geldt bij ${c.x}: "${p}"?`),
          about("address", 8, `Zit ${c.x} nog op hetzelfde adres?`, ["address"]),
          ...block.serviceRec(c, 0, (s) => `Welke ${c.noun} in ${c.place} verkoopt ${s}?`),
          ...block.sundayRec(c),
          ...block.serviceRec(c, 1, (s) => `Waar in ${c.place} kan ik ${s} kopen?`),
          ...block.saturdayRec(c),
        ],
        c,
      );
    },
  },

  "garages-fietsenmakers": {
    slug: "garages-fietsenmakers",
    labelNl: "Autogarages, fietsenmakers en reparatie",
    googleCategories: ["car_repair", "car_dealer", "auto_parts_store", "bicycle_store", "bicycle_repair", "garage", "autobedrijf", "fietsenmaker", "fietsenwinkel", "rijwiel", "apk"],
    sbiCodes: ["4520", "4511", "9529", "4764"],
    decisiveFacts: ["Wat een APK of reparatie kost", "Welke merken en soorten je doet", "Of je zonder afspraak terecht kunt"],
    typicalSource: "Oude prijs op site",
    biggestRisk: "Verkeerde vergelijking",
    decisiveCriteria: [9, 6, 7, 10],
    nouns: [
      { match: /fiets|rijwiel|bike/i, noun: "fietsenmaker" },
    ],
    defaultNoun: "garage",
    prompts(facts) {
      const c = ctxFor(facts, this);
      return finish(
        [
          ...block.price(c, (l) => `Wat kost ${l} bij ${c.x}?`),
          ...block.serviceYes(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.serviceYes(c, 1, (s) => `Repareert ${c.x} ook ${s}?`),
          ...block.serviceNo(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.policy(c, /afspraak/i, () => `Kan ik bij ${c.x} zonder afspraak langskomen?`),
          ...block.area(c),
          ...block.serviceRec(c, 0, (s) => `Welke ${c.noun} in ${c.place} doet ${s}?`),
          ...block.serviceRec(c, 1, (s) => `Wie repareert ${s} in ${c.place}?`),
          ...block.policyRec(c, /zonder afspraak/i, () => `Welke ${c.noun} in ${c.place} helpt zonder afspraak?`),
          ...block.saturdayRec(c),
        ],
        c,
      );
    },
  },

  "kappers-schoonheid": {
    slug: "kappers-schoonheid",
    labelNl: "Kappers, schoonheid en wellness",
    googleCategories: ["hair_care", "hair_salon", "beauty_salon", "spa", "nail_salon", "barber_shop", "kapper", "kapsalon", "barbier", "schoonheidssalon", "nagelstudio", "wellness"],
    sbiCodes: ["9602", "9604"],
    decisiveFacts: ["Of je zonder afspraak terecht kunt", "Wat knippen kost", "Je openingstijden"],
    typicalSource: "Geen website",
    biggestRisk: "Grijze stip",
    decisiveCriteria: [3, 10, 9, 1],
    nouns: [
      { match: /barber|barbier/i, noun: "barbier" },
      { match: /schoonheid|beauty|nagel/i, noun: "schoonheidssalon" },
    ],
    defaultNoun: "kapper",
    prompts(facts) {
      const c = ctxFor(facts, this);
      return finish(
        [
          ...block.policy(c, /afspraak/i, () => `Kan ik bij ${c.x} zonder afspraak terecht?`),
          ...block.price(c, (l) => `Wat kost ${l} bij ${c.x}?`),
          ...block.serviceYes(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.serviceYes(c, 1, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.serviceNo(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          about("hours", 3, `Is ${c.x} op maandag open?`, ["hours.0"]),
          ...block.policyRec(c, /zonder afspraak/i, () => `${c.noun.charAt(0).toUpperCase() + c.noun.slice(1)} in ${c.place} zonder afspraak?`),
          ...block.serviceRec(c, 0, (s) => `Welke ${c.noun} in ${c.place} doet ${s}?`),
          ...block.saturdayRec(c),
          ...block.sundayRec(c),
        ],
        c,
      );
    },
  },

  "advocaten-notarissen-accountants": {
    slug: "advocaten-notarissen-accountants",
    labelNl: "Advocaten, notarissen, accountants en administratiekantoren",
    googleCategories: ["lawyer", "notary_public", "accounting", "tax_consultant", "advocaat", "advocatenkantoor", "notaris", "accountant", "administratiekantoor", "belastingadviseur"],
    sbiCodes: ["6910", "6920"],
    decisiveFacts: ["Welke specialismen je hebt", "Of je ook particulieren helpt", "Of een naamgenoot met een tuchtzaak jou wordt aangerekend"],
    typicalSource: "Oud artikel, tuchtzaak naamgenoot",
    biggestRisk: "Vertrouwen weg",
    decisiveCriteria: [6, 7, 11, 12, 9],
    nouns: [
      { match: /notar/i, noun: "notaris" },
      { match: /account|administratie|belasting/i, noun: "accountant" },
    ],
    defaultNoun: "advocaat",
    prompts(facts) {
      const c = ctxFor(facts, this);
      return finish(
        [
          ...block.serviceYes(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.serviceYes(c, 1, (s) => `Kan ik bij ${c.x} terecht voor ${s}?`),
          ...block.serviceNo(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.price(c, (l) => `Wat kost ${l} bij ${c.x}?`),
          ...block.cred(c, (s) => `Is ${c.x} aangesloten bij ${s}?`),
          ...block.identity(facts, c),
          ...block.serviceRec(c, 0, (s) => `Welke ${c.noun} in ${c.place} doet ${s}?`),
          ...block.serviceRec(c, 1, (s) => `${c.noun.charAt(0).toUpperCase() + c.noun.slice(1)} ${s} in ${c.place}, wie kan ik bellen?`),
          ...block.credRec(c, (s) => `Welke ${c.noun} in ${c.place} is aangesloten bij ${s}?`),
          ...block.areaRec(c),
        ],
        c,
      );
    },
  },

  "makelaars-hypotheek": {
    slug: "makelaars-hypotheek",
    labelNl: "Makelaars en hypotheekadviseurs",
    googleCategories: ["real_estate_agency", "real_estate_agent", "mortgage_broker", "mortgage_lender", "makelaar", "makelaardij", "hypotheekadviseur", "hypotheek"],
    sbiCodes: ["6831", "6619"],
    decisiveFacts: ["Wat je rekent (courtage of vaste prijs)", "Waar je bij aangesloten bent", "In welke plaatsen je werkt"],
    typicalSource: "Oude pagina",
    biggestRisk: "Verkeerde prijs",
    decisiveCriteria: [9, 12, 4],
    nouns: [{ match: /hypotheek/i, noun: "hypotheekadviseur" }],
    defaultNoun: "makelaar",
    prompts(facts) {
      const c = ctxFor(facts, this);
      return finish(
        [
          ...block.price(c, (l) => `Wat kost ${l} bij ${c.x}?`),
          ...block.cred(c, (s) => `Is ${c.x} ${s}?`),
          ...block.serviceYes(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.serviceNo(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.area(c),
          ...block.policy(c, /vaste prijs|courtage/i, (p) => `Geldt bij ${c.x}: "${p}"?`),
          ...block.areaRec(c),
          ...block.credRec(c, (s) => `Welke ${c.noun} in ${c.place} is ${s}?`),
          ...block.serviceRec(c, 0, (s) => `Welke ${c.noun} in ${c.place} doet ook ${s}?`),
          ...block.policyRec(c, /vaste prijs/i, () => `${c.noun.charAt(0).toUpperCase() + c.noun.slice(1)} in ${c.place} met vaste prijs?`),
        ],
        c,
      );
    },
  },

  "kinderopvang-sport-rijscholen": {
    slug: "kinderopvang-sport-rijscholen",
    labelNl: "Kinderopvang, sportscholen en rijscholen",
    googleCategories: ["child_care_agency", "day_care", "preschool", "gym", "fitness_center", "sports_club", "driving_school", "kinderopvang", "kinderdagverblijf", "bso", "sportschool", "fitness", "rijschool", "autorijschool"],
    sbiCodes: ["8891", "9311", "9313", "8553"],
    decisiveFacts: ["Of er plek is of een wachtlijst", "Je openingstijden", "Wat je aanbiedt (baby, automaat, vroeg open)"],
    typicalSource: "Oud bericht",
    biggestRisk: "\"Vol\" terwijl plek",
    decisiveCriteria: [5, 3, 6],
    nouns: [
      { match: /sport|fit|gym/i, noun: "sportschool" },
      { match: /rijschool|rijles|autorij/i, noun: "rijschool" },
    ],
    defaultNoun: "kinderopvang",
    prompts(facts) {
      const c = ctxFor(facts, this);
      return finish(
        [
          ...block.urgency(c, `Heeft ${c.x} nu plek, of is er een wachtlijst?`),
          about("hours", 3, `Hoe laat gaat ${c.x} op maandag open?`, ["hours.0"]),
          ...block.serviceYes(c, 0, (s) => `Heeft ${c.x} ${s}?`),
          ...block.serviceYes(c, 1, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.serviceNo(c, 0, (s) => `Doet ${c.x} ook ${s}?`),
          ...block.price(c, (l) => `Wat kost ${l} bij ${c.x}?`),
          ...block.urgencyRec(c, `Welke ${c.noun} in ${c.place} heeft nu plek?`),
          ...block.serviceRec(c, 0, (s) => `Welke ${c.noun} in ${c.place} heeft ${s}?`),
          ...block.saturdayRec(c),
          ...block.serviceRec(c, 1, (s) => `${c.noun.charAt(0).toUpperCase() + c.noun.slice(1)} in ${c.place} met ${s}?`),
        ],
        c,
      );
    },
  },
};

export const SECTOR_LIST: SectorPack[] = SECTOR_SLUGS.map((s) => SECTORS[s]);

export function sectorPack(slug: SectorSlug | null | undefined): SectorPack | null {
  return slug ? (SECTORS[slug] ?? null) : null;
}

export function isSectorSlug(s: unknown): s is SectorSlug {
  return typeof s === "string" && (SECTOR_SLUGS as string[]).includes(s);
}

/**
 * Infer the sector from the Google category (Places type or a Dutch category
 * word) or the KvK SBI code. An explicit override always wins. Returns null
 * when nothing matches, so the owner picks one by hand.
 */
export function inferSector(googleCategory?: string | null, sbi?: string | null, override?: SectorSlug | null): SectorSlug | null {
  if (override && isSectorSlug(override)) return override;
  const cat = (googleCategory ?? "").toLowerCase().trim();
  if (cat) {
    // Whole-word match on the category ("hair_salon" -> hair, salon; "Bakkerij De Vries" -> bakkerij),
    // or a longer category word inside it ("installatiebedrijf" contains "installateur"? no; "loodgietersbedrijf" contains "loodgieter").
    const words = new Set(cat.split(/[^a-z\u00c0-\u024f-]+/).filter(Boolean));
    for (const pack of SECTOR_LIST) {
      if (pack.googleCategories.some((g) => cat === g || words.has(g) || (g.length >= 6 && cat.includes(g)))) return pack.slug;
    }
  }
  const code = (sbi ?? "").replace(/\D/g, "");
  if (code) {
    // Longest prefix wins ("4322" before "43").
    let best: { slug: SectorSlug; len: number } | null = null;
    for (const pack of SECTOR_LIST) {
      for (const prefix of pack.sbiCodes) {
        if (code.startsWith(prefix) && (!best || prefix.length > best.len)) best = { slug: pack.slug, len: prefix.length };
      }
    }
    if (best) return best.slug;
  }
  return null;
}

/** Prompts for a sector pack, or none when the business has no sector. */
export function sectorPrompts(facts: Facts, sector: SectorSlug | null | undefined): SectorPromptTemplate[] {
  const pack = sectorPack(sector);
  return pack ? pack.prompts(facts) : [];
}
