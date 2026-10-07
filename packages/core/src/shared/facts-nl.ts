/**
 * Dutch, human wording for fact keys and normalised claim values.
 * Used by the correction emails, the reports and the proof cards.
 */
import type { FactKey, Finding } from "../types.js";

const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];

export function factLabelNl(factKey: FactKey, subject: string | null): string {
  switch (factKey) {
    case "existence":
      return "of het bedrijf open is";
    case "hours": {
      const idx = subject != null && /^\d$/.test(subject) ? Number(subject) : -1;
      return idx >= 0 && idx < 7 ? `de openingstijden op ${DAYS[idx]}` : "de openingstijden";
    }
    case "phone":
      return "het telefoonnummer";
    case "address":
      return "het adres";
    case "website":
      return "de website";
    case "service":
      return subject ? `of ${subject} wordt aangeboden` : "de diensten";
    case "price":
      return subject ? `de prijs van ${subject}` : "de prijzen";
    case "policy":
      return subject ? `de afspraak over ${subject}` : "de afspraken";
    case "payment":
      return "de betaalmogelijkheden";
    default:
      return "de gegevens";
  }
}

/** Short field name for tables: "Telefoon", "Zondag", ... */
export function factFieldNl(factKey: FactKey, subject: string | null): string {
  switch (factKey) {
    case "existence":
      return "Status";
    case "hours": {
      const idx = subject != null && /^\d$/.test(subject) ? Number(subject) : -1;
      const day = idx >= 0 && idx < 7 ? DAYS[idx]! : "";
      return day ? day.charAt(0).toUpperCase() + day.slice(1) : "Openingstijden";
    }
    case "phone":
      return "Telefoon";
    case "address":
      return "Adres";
    case "website":
      return "Website";
    case "service":
      return subject ? `Dienst: ${subject}` : "Diensten";
    case "price":
      return subject ? `Prijs: ${subject}` : "Prijzen";
    case "policy":
      return subject ? `Beleid: ${subject}` : "Beleid";
    case "payment":
      return "Betalen";
    default:
      return "Gegevens";
  }
}

/** Normalised value → Dutch wording. "closed" → "gesloten", "yes" → "ja", "09:00-17:00" → "09:00 tot 17:00". */
export function valueNl(factKey: FactKey, value: string): string {
  const v = value.trim();
  const lower = v.toLowerCase();
  if (factKey === "existence") {
    if (["closed", "permanently_closed", "permanent gesloten", "permanently closed"].includes(lower)) return "definitief gesloten";
    if (["temporarily_closed", "temporarily closed"].includes(lower)) return "tijdelijk gesloten";
    if (["open", "exists", "yes"].includes(lower)) return "open";
  }
  if (lower === "closed" || lower === "gesloten") return "gesloten";
  if (lower === "yes" || lower === "ja") return "ja";
  if (lower === "no" || lower === "nee") return "nee";
  const hours = /^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/.exec(v);
  if (hours) return `${hours[1]} tot ${hours[2]}`;
  if (factKey === "price" && /^\d+(\.\d+)?$/.test(v)) return `€ ${Number(v).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}`;
  return v;
}

export interface FindingWordsNl {
  what: string; // "de openingstijden op zondag"
  field: string; // "Zondag"
  wrong: string; // "gesloten"
  correct: string; // "10:00 tot 16:00"
  frequency: string; // "7 van de 10 keer"
}

export function findingWordsNl(f: Pick<Finding, "factKey" | "subject" | "wrongValue" | "correctValue" | "frequency" | "sampleCount">): FindingWordsNl {
  return {
    what: factLabelNl(f.factKey, f.subject),
    field: factFieldNl(f.factKey, f.subject),
    wrong: valueNl(f.factKey, f.wrongValue),
    correct: valueNl(f.factKey, f.correctValue),
    frequency: `${f.frequency} van de ${f.sampleCount} keer`,
  };
}

export function hostOfUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
