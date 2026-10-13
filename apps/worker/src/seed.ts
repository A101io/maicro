/**
 * Dev seed for mock mode: one business with verified facts and a `setup` job,
 * so `WORKER_SEED=1 WORKER_ONCE=1 VIDALO_MOCK=1 pnpm --filter @vidalo/worker start`
 * exercises setup → publish → sync → baseline scan → fixes → mails end to end.
 */
import type { Facts } from "@vidalo/core/types";
import { getDb } from "./compat.js";
import { log } from "./log.js";

export async function seedDemo(): Promise<string> {
  const db = getDb();
  const business = await db.upsertBusiness({
    name: "Bakkerij De Vries",
    place: "Haarlem",
    domain: "bakkerijdevries.nl",
    kvk: "34567890",
    ownerEmail: "eigenaar@bakkerijdevries.nl",
    plan: "monitor",
    status: "trial",
    sector: "winkels",
  });
  const facts: Omit<Facts, "businessId" | "version" | "provisional" | "verifiedAt"> = {
    name: business.name,
    place: business.place,
    address: "Grote Houtstraat 12",
    postcode: "2011 SM",
    phone: "023-5312345",
    email: "info@bakkerijdevries.nl",
    website: "https://bakkerijdevries.nl",
    openStatus: "open",
    hours: [
      { day: 0, open: "08:00", close: "18:00", closed: false },
      { day: 1, open: "08:00", close: "18:00", closed: false },
      { day: 2, open: "08:00", close: "18:00", closed: false },
      { day: 3, open: "08:00", close: "18:00", closed: false },
      { day: 4, open: "08:00", close: "20:00", closed: false },
      { day: 5, open: "08:00", close: "17:00", closed: false },
      { day: 6, open: null, close: null, closed: true },
    ],
    servicesYes: ["Desembrood", "Taarten op bestelling", "Glutenvrij brood"],
    servicesNo: ["Bezorgen", "Catering"],
    prices: [{ label: "Een brood", amount: 3.95, unit: "per stuk" }],
    policies: ["Bestellen kan telefonisch", "Taarten minimaal 2 dagen van tevoren"],
    paymentMethods: ["pin", "contant"],
    notConfusedWith: ["Bakkerij De Vries in Hoofddorp (ander bedrijf)"],
    serviceArea: { places: ["Haarlem", "Heemstede"], radiusKm: null },
    urgency: { available: false, hoursNl: null },
    credentials: [],
    sector: "winkels",
  };
  await db.insertFacts(business.id, facts, { provisional: false, verifiedAt: new Date().toISOString() });
  const job = await db.enqueueJob("setup", { businessId: business.id });
  log.info("seed.done", { businessId: business.id, slug: business.slug, setupJobId: job.id });
  return business.id;
}
