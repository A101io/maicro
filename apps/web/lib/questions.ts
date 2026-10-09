import type { FactKey, Finding } from "@maicro/core/types";
import { describeValue } from "@maicro/core/scanner";
import { copy } from "@maicro/core/copy";

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

/** The recommendation question ("Welk bedrijf in Haarlem doet warmtepompen?") behind a not-named finding. */
export function recommendationQuestionFor(factKey: FactKey, subject: string | null, place: string): string {
  const q = copy.recommendation.question;
  switch (factKey) {
    case "service":
      return subject ? q.service(subject, place) : q.other(place);
    case "area":
      return subject ? q.area(subject) : q.other(place);
    case "urgency":
      return q.urgency(place);
    case "hours": {
      const day = subject != null && /^\d$/.test(subject) ? DAYS[Number(subject)] : null;
      return day ? q.hours(day, place) : q.other(place);
    }
    case "credential":
      return subject ? q.credential(subject, place) : q.other(place);
    case "policy":
      return subject ? q.policy(subject, place) : q.other(place);
    default:
      return q.other(place);
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
