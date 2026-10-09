import type { FactKey, Finding } from "@maicro/core/types";
import { describeValue } from "@maicro/core/scanner";

const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];

/** The Dutch question a customer would ask for a given fact, used as the "Vraag" line on cards. */
export function questionFor(factKey: FactKey, subject: string | null, name: string, place: string): string {
  const who = `${name} in ${place}`;
  switch (factKey) {
    case "existence":
      return `Bestaat ${who} nog en is het open?`;
    case "hours": {
      const day = subject != null && /^\d$/.test(subject) ? DAYS[Number(subject)] : null;
      return day ? `Is ${who} op ${day} open?` : `Wat zijn de openingstijden van ${who}?`;
    }
    case "phone":
      return `Wat is het telefoonnummer van ${who}?`;
    case "address":
      return `Wat is het adres van ${who}?`;
    case "website":
      return `Wat is de website van ${who}?`;
    case "service":
      return subject ? `Doet ${who} ook aan ${subject}?` : `Welke diensten biedt ${who}?`;
    case "price":
      return subject ? `Wat kost ${subject} bij ${who}?` : `Wat zijn de prijzen van ${who}?`;
    case "policy":
      return subject ? `Geldt bij ${who}: ${subject}?` : `Welke afspraken gelden bij ${who}?`;
    case "payment":
      return subject === "pin" || !subject ? `Kan ik pinnen bij ${who}?` : `Kan ik met ${subject} betalen bij ${who}?`;
    case "area":
      return subject ? `Komt ${who} ook in ${subject}?` : `Waar werkt ${who}?`;
    case "urgency":
      return `Heeft ${who} een spoeddienst?`;
    case "credential":
      return subject ? `Is ${who} erkend voor ${subject}?` : `Welke erkenningen heeft ${who}?`;
    case "identity":
      return subject ? `Is ${who} hetzelfde als ${subject}?` : `Is ${who} hetzelfde als het bedrijf met die naam elders?`;
  }
}

/** Human-readable Dutch for a stored (normalised) value. */
export function humanValue(factKey: FactKey, value: string, subject: string | null): string {
  return describeValue(factKey, value, subject);
}

export function wrongText(f: Pick<Finding, "factKey" | "wrongValue" | "subject">): string {
  return humanValue(f.factKey, f.wrongValue, f.subject);
}
export function correctText(f: Pick<Finding, "factKey" | "correctValue" | "subject">): string {
  return humanValue(f.factKey, f.correctValue, f.subject);
}
