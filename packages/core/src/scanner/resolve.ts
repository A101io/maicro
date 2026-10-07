/**
 * Business resolution (name + place -> candidates) and provisional facts.
 *
 * resolveBusiness: Google Places Text Search (GOOGLE_PLACES_API_KEY), KvK
 * search (KVK_API_KEY) when present; mock mode returns one synthetic
 * candidate built from the query. The web app shows the candidates so the
 * owner confirms the right one (prevents name collisions).
 *
 * draftProvisionalFacts: scrape the website homepage + contact page and pull
 * phone / address / hours heuristically. Always provisional=true; the owner
 * confirms them in setup (facts v1, verified_at).
 */
import type { Facts, Hours } from "../types";
import { DAY_NAMES_NL, normalizePhone, normalizeTime, slugify } from "./normalize";
import { fetchText, hashString, htmlToText, seededRandom } from "./util";

export interface BusinessCandidate {
  name: string;
  address: string | null;
  postcode: string | null;
  place: string | null;
  placeId: string | null;
  kvk: string | null;
  website: string | null;
  phone: string | null;
  openStatus: Facts["openStatus"];
  hours: Hours[];
  source: "google" | "kvk" | "mock";
}

export type DraftFacts = Omit<Facts, "businessId" | "version">;

const isMock = () => process.env.MAICRO_MOCK === "1";

// ---------------------------------------------------------------------------
// Google Places (New) Text Search
// ---------------------------------------------------------------------------

interface GPlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  businessStatus?: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";
  regularOpeningHours?: { periods?: { open?: { day?: number; hour?: number; minute?: number }; close?: { day?: number; hour?: number; minute?: number } }[] };
}

/** Google day: 0 = Sunday .. 6 = Saturday -> ours: 0 = Monday .. 6 = Sunday. */
const googleDay = (d: number): Hours["day"] => (((d + 6) % 7) as Hours["day"]);

function hoursFromGoogle(p: GPlace): Hours[] {
  const periods = p.regularOpeningHours?.periods ?? [];
  if (!periods.length) return [];
  const byDay = new Map<number, Hours>();
  for (const per of periods) {
    if (per.open?.day == null) continue;
    const day = googleDay(per.open.day);
    const fmt = (t?: { hour?: number; minute?: number }) => (t ? `${String(t.hour ?? 0).padStart(2, "0")}:${String(t.minute ?? 0).padStart(2, "0")}` : null);
    if (!byDay.has(day)) byDay.set(day, { day, open: fmt(per.open), close: fmt(per.close), closed: false });
  }
  const out: Hours[] = [];
  for (let d = 0; d < 7; d++) out.push(byDay.get(d) ?? { day: d as Hours["day"], open: null, close: null, closed: true });
  return out;
}

function splitAddress(formatted: string | undefined): { address: string | null; postcode: string | null; place: string | null } {
  if (!formatted) return { address: null, postcode: null, place: null };
  // "Stationsplein 12, 2011 LR Haarlem, Nederland"
  const m = formatted.match(/^(.*?),\s*(\d{4}\s?[A-Z]{2})\s+([^,]+)/);
  if (m) return { address: m[1]!.trim(), postcode: m[2]!.replace(/\s/, " ").toUpperCase(), place: m[3]!.trim() };
  const parts = formatted.split(",").map((s) => s.trim());
  return { address: parts[0] ?? null, postcode: null, place: parts[1] ?? null };
}

async function googlePlaces(query: string, place?: string): Promise<BusinessCandidate[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": key,
      "x-goog-fieldmask":
        "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.businessStatus,places.regularOpeningHours",
    },
    body: JSON.stringify({ textQuery: place ? `${query} ${place}` : query, languageCode: "nl", regionCode: "NL", maxResultCount: 3 }),
  });
  if (!res.ok) throw new Error(`google places ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { places?: GPlace[] };
  return (data.places ?? []).slice(0, 3).map((p) => {
    const addr = splitAddress(p.formattedAddress);
    return {
      name: p.displayName?.text ?? query,
      address: addr.address,
      postcode: addr.postcode,
      place: addr.place ?? place ?? null,
      placeId: p.id ?? null,
      kvk: null,
      website: p.websiteUri ?? null,
      phone: normalizePhone(p.internationalPhoneNumber ?? p.nationalPhoneNumber) ?? p.nationalPhoneNumber ?? null,
      openStatus: p.businessStatus === "CLOSED_PERMANENTLY" ? "permanently_closed" : p.businessStatus === "CLOSED_TEMPORARILY" ? "temporarily_closed" : "open",
      hours: hoursFromGoogle(p),
      source: "google",
    };
  });
}

// ---------------------------------------------------------------------------
// KvK Zoeken API
// ---------------------------------------------------------------------------

interface KvkResult {
  kvkNummer?: string;
  naam?: string;
  adres?: { binnenlandsAdres?: { straatnaam?: string; huisnummer?: number; huisnummerToevoeging?: string; postcode?: string; plaats?: string } };
}

async function kvkSearch(query: string, place?: string): Promise<BusinessCandidate[]> {
  const key = process.env.KVK_API_KEY;
  if (!key) return [];
  const url = new URL("https://api.kvk.nl/api/v2/zoeken");
  url.searchParams.set("naam", query);
  if (place) url.searchParams.set("plaats", place);
  url.searchParams.set("type", "hoofdvestiging");
  url.searchParams.set("resultatenPerPagina", "3");
  const res = await fetch(url, { headers: { apikey: key } });
  if (res.status === 404) return []; // KvK returns 404 for "no results"
  if (!res.ok) throw new Error(`kvk ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { resultaten?: KvkResult[] };
  return (data.resultaten ?? []).slice(0, 3).map((r) => {
    const a = r.adres?.binnenlandsAdres;
    return {
      name: r.naam ?? query,
      address: a?.straatnaam ? `${a.straatnaam} ${a.huisnummer ?? ""}${a.huisnummerToevoeging ?? ""}`.trim() : null,
      postcode: a?.postcode ?? null,
      place: a?.plaats ?? place ?? null,
      placeId: null,
      kvk: r.kvkNummer ?? null,
      website: null,
      phone: null,
      openStatus: "open",
      hours: [],
      source: "kvk",
    };
  });
}

// ---------------------------------------------------------------------------
// Mock
// ---------------------------------------------------------------------------

const STREETS = ["Grote Houtstraat", "Stationsplein", "Kerkstraat", "Dorpsstraat", "Zijlweg", "Molenstraat", "Hoofdstraat", "Marktplein", "Nieuwstraat", "Lange Veerstraat"];

/** Keyword -> plausible services / prices / policies for synthetic facts. */
const PROFILES: { match: RegExp; yes: string[]; no: string[]; prices: Facts["prices"]; policies: string[] }[] = [
  { match: /bakker/i, yes: ["taarten op bestelling", "glutenvrij brood"], no: ["bezorgen", "catering"], prices: [{ label: "een brood", amount: 3.95 }, { label: "appeltaart", amount: 14.5 }], policies: ["Pinnen mogelijk", "Bestellen kan telefonisch"] },
  { match: /kapper|kapsalon|barber/i, yes: ["knippen zonder afspraak", "kleuren"], no: ["extensions", "nagels"], prices: [{ label: "knippen", amount: 32.5 }, { label: "kleuren", amount: 65 }], policies: ["Alleen op afspraak", "Pinnen mogelijk"] },
  { match: /garage|auto/i, yes: ["apk-keuring", "bandenwissel"], no: ["schadeherstel", "ruitreparatie"], prices: [{ label: "apk", amount: 49 }, { label: "bandenwissel", amount: 35 }], policies: ["Alleen op afspraak", "Pinnen mogelijk"] },
  { match: /fiets/i, yes: ["reparatie", "verhuur"], no: ["e-bike verhuur", "bezorgen"], prices: [{ label: "bandenplakken", amount: 12.5 }, { label: "fietshuur per dag", amount: 15 }], policies: ["Pinnen mogelijk", "Reparatie zonder afspraak"] },
  { match: /restaurant|eetcafe|café|cafe|bistro/i, yes: ["reserveren", "vegetarische gerechten"], no: ["bezorgen", "afhalen"], prices: [{ label: "dagmenu", amount: 27.5 }, { label: "lunch", amount: 14.5 }], policies: ["Reserveren aanbevolen", "Pinnen mogelijk"] },
  { match: /tandarts|fysio|praktijk/i, yes: ["spoedafspraken", "nieuwe patiënten"], no: ["avondspreekuur", "weekenddienst"], prices: [], policies: ["Alleen op afspraak", "Pinnen mogelijk"] },
  { match: /.*/, yes: ["advies op maat", "reparatie"], no: ["bezorgen", "verhuur"], prices: [{ label: "intakegesprek", amount: 45 }, { label: "uurtarief", amount: 65 }], policies: ["Pinnen mogelijk", "Alleen op afspraak"] },
];

export function mockCandidate(query: string, place?: string): BusinessCandidate {
  const plc = place ?? "Haarlem";
  const rng = seededRandom(`${query}|${plc}`);
  const street = STREETS[Math.floor(rng() * STREETS.length)]!;
  const number = 1 + Math.floor(rng() * 120);
  const postcode = `${2000 + Math.floor(rng() * 7000)} ${String.fromCharCode(65 + Math.floor(rng() * 26))}${String.fromCharCode(65 + Math.floor(rng() * 26))}`;
  let subscriber = "";
  for (let i = 0; i < 7; i++) subscriber += String(Math.floor(rng() * 10));
  const slug = slugify(query);
  return {
    name: query,
    address: `${street} ${number}`,
    postcode,
    place: plc,
    placeId: `mock-${hashString(`${query}|${plc}`).toString(16)}`,
    kvk: String(10_000_000 + (hashString(`kvk|${query}|${plc}`) % 89_999_999)),
    website: `https://www.${slug}.nl`,
    phone: `+3123${subscriber}`,
    openStatus: "open",
    hours: [
      { day: 0, open: "09:00", close: "17:30", closed: false },
      { day: 1, open: "09:00", close: "17:30", closed: false },
      { day: 2, open: "09:00", close: "17:30", closed: false },
      { day: 3, open: "09:00", close: "17:30", closed: false },
      { day: 4, open: "09:00", close: "21:00", closed: false },
      { day: 5, open: "09:00", close: "17:00", closed: false },
      { day: 6, open: null, close: null, closed: true },
    ],
    source: "mock",
  };
}

/** Up to 3 candidates; Google first, then KvK; mock mode returns one synthetic candidate. */
export async function resolveBusiness(query: string, place?: string): Promise<BusinessCandidate[]> {
  if (isMock()) return [mockCandidate(query, place)];
  const [google, kvk] = await Promise.all([
    googlePlaces(query, place).catch((err) => {
      console.warn(`[resolve] google places failed: ${(err as Error).message}`);
      return [] as BusinessCandidate[];
    }),
    kvkSearch(query, place).catch((err) => {
      console.warn(`[resolve] kvk failed: ${(err as Error).message}`);
      return [] as BusinessCandidate[];
    }),
  ]);
  // Merge: attach a KvK number to a Google candidate with the same postcode.
  for (const g of google) {
    const k = kvk.find((x) => x.postcode && g.postcode && x.postcode.replace(/\s/g, "") === g.postcode.replace(/\s/g, ""));
    if (k) g.kvk = k.kvk;
  }
  const merged = [...google, ...kvk.filter((k) => !google.some((g) => g.kvk === k.kvk))];
  if (!merged.length) return [mockCandidate(query, place)].map((c) => ({ ...c, placeId: null, kvk: null, website: null, phone: null, address: null, postcode: null, hours: [] }));
  return merged.slice(0, 3);
}

// ---------------------------------------------------------------------------
// Provisional facts
// ---------------------------------------------------------------------------

const PHONE_RE = /(?:\+31|0031|0)\s?[1-9](?:[\s-]?\d){8}\b/g;
const ADDRESS_RE = /([A-Z][\p{L}.'-]*(?:\s(?:[A-Z][\p{L}.'-]*|de|van|der|den|het|'t))*\s\d+[a-zA-Z]?)\s*,?\s*(\d{4}\s?[A-Z]{2})\s+([A-Z][\p{L}-]+)/u;

/** Scrape opening hours from page text: "maandag 09:00 - 17:30", "ma-vr 9.00-17.00", "zondag gesloten". */
export function hoursFromText(text: string): Hours[] {
  const lower = text.toLowerCase();
  const out = new Map<number, Hours>();
  const short = ["ma", "di", "wo", "do", "vr", "za", "zo"];
  const timeRange = String.raw`(\d{1,2}(?:[:.]\d{2})?)\s*(?:uur)?\s*(?:tot|-|–)\s*(\d{1,2}(?:[:.]\d{2})?)`;
  // Ranges like "ma-vr 09:00-17:30" / "ma t/m vr".
  const rangeRe = new RegExp(`\\b(${short.join("|")})\\s*(?:-|–|t/m|tot en met)\\s*(${short.join("|")})\\b[^\\n\\d]{0,20}(?:${timeRange}|(gesloten))`, "g");
  for (const m of lower.matchAll(rangeRe)) {
    const a = short.indexOf(m[1]!);
    const b = short.indexOf(m[2]!);
    if (a < 0 || b < 0) continue;
    for (let d = a; d <= b; d++) {
      if (out.has(d)) continue;
      if (m[5]) out.set(d, { day: d as Hours["day"], open: null, close: null, closed: true });
      else out.set(d, { day: d as Hours["day"], open: normalizeTime(m[3]!), close: normalizeTime(m[4]!), closed: false });
    }
  }
  DAY_NAMES_NL.forEach((name, d) => {
    if (out.has(d)) return;
    const re = new RegExp(`\\b(?:${name}|${short[d]})\\b[^\\n\\d]{0,20}(?:${timeRange}|(gesloten))`);
    const m = lower.match(re);
    if (!m) return;
    if (m[3]) out.set(d, { day: d as Hours["day"], open: null, close: null, closed: true });
    else out.set(d, { day: d as Hours["day"], open: normalizeTime(m[1]!), close: normalizeTime(m[2]!), closed: false });
  });
  return [...out.values()].sort((a, b) => a.day - b.day);
}

async function scrapeSite(website: string): Promise<{ phone: string | null; address: string | null; postcode: string | null; place: string | null; hours: Hours[] }> {
  const base = website.replace(/\/$/, "");
  const pages = [base, `${base}/contact`, `${base}/contact/`, `${base}/openingstijden`, `${base}/over-ons`];
  let phone: string | null = null;
  let address: { address: string; postcode: string; place: string } | null = null;
  let hours: Hours[] = [];
  for (const url of pages) {
    const html = await fetchText(url, { timeoutMs: 8_000, maxBytes: 300_000 });
    if (!html) continue;
    const text = htmlToText(html);
    if (!phone) {
      for (const m of text.matchAll(PHONE_RE)) {
        const n = normalizePhone(m[0]);
        if (n) {
          phone = n;
          break;
        }
      }
    }
    if (!address) {
      const m = text.match(ADDRESS_RE);
      if (m) address = { address: m[1]!, postcode: m[2]!.toUpperCase().replace(/(\d{4})([A-Z]{2})/, "$1 $2"), place: m[3]! };
    }
    if (hours.length < 7) {
      const h = hoursFromText(text);
      if (h.length > hours.length) hours = h;
    }
    if (phone && address && hours.length >= 7) break;
  }
  return { phone, address: address?.address ?? null, postcode: address?.postcode ?? null, place: address?.place ?? null, hours };
}

/**
 * Draft provisional facts for a candidate: website scrape (real mode) or a
 * synthetic profile (mock). Never sets verifiedAt; the owner confirms later.
 */
export async function draftProvisionalFacts(candidate: BusinessCandidate, opts: { place?: string } = {}): Promise<DraftFacts> {
  const place = candidate.place ?? opts.place ?? "";
  const profile = PROFILES.find((p) => p.match.test(candidate.name))!;
  let scraped: Awaited<ReturnType<typeof scrapeSite>> = { phone: null, address: null, postcode: null, place: null, hours: [] };
  if (!isMock() && candidate.website) {
    try {
      scraped = await scrapeSite(candidate.website);
    } catch (err) {
      console.warn(`[resolve] scrape failed for ${candidate.website}: ${(err as Error).message}`);
    }
  }
  const hours = candidate.hours.length === 7 ? candidate.hours : scraped.hours.length ? scraped.hours : candidate.hours;
  return {
    verifiedAt: null,
    provisional: true,
    name: candidate.name,
    place,
    address: candidate.address ?? scraped.address,
    postcode: candidate.postcode ?? scraped.postcode,
    phone: candidate.phone ?? scraped.phone,
    email: null,
    website: candidate.website,
    openStatus: candidate.openStatus,
    hours,
    // Services / prices / policies cannot be scraped reliably; the mock profile
    // fills them so prompts exist, the real path leaves them for the owner.
    servicesYes: isMock() ? profile.yes : [],
    servicesNo: isMock() ? profile.no : [],
    prices: isMock() ? profile.prices : [],
    policies: isMock() ? profile.policies : [],
    paymentMethods: isMock() ? ["pin", "contant"] : [],
    notConfusedWith: [],
  };
}
