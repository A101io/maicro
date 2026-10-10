/**
 * Ownership of a business is proven by signing in with Google and holding a
 * Business Profile location for it: the location's place id must equal the
 * business's google_place_id. An e-mail address proves nothing; anyone can
 * type one into a report.
 */
import type { BusinessRecord } from "../db/types.js";

export interface ProfileLocation {
  /** "locations/123…" */
  name: string;
  title?: string | null;
  /** metadata.placeId from the Business Information API */
  placeId?: string | null;
}

export type OwnershipCheck =
  | { ok: true; location: ProfileLocation }
  | { ok: false; reason: "no_place_id" | "no_locations" | "no_match" };

export function matchProfileLocation(business: Pick<BusinessRecord, "googlePlaceId">, locations: ProfileLocation[]): OwnershipCheck {
  if (!business.googlePlaceId) return { ok: false, reason: "no_place_id" };
  if (locations.length === 0) return { ok: false, reason: "no_locations" };
  const location = locations.find((l) => l.placeId && l.placeId === business.googlePlaceId);
  return location ? { ok: true, location } : { ok: false, reason: "no_match" };
}

export function isVerifiedOwner(business: Pick<BusinessRecord, "ownerVerifiedAt" | "ownerUserId">, userId: string | null | undefined): boolean {
  return Boolean(business.ownerVerifiedAt && userId && business.ownerUserId === userId);
}
