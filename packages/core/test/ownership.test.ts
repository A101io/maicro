import { describe, expect, it } from "vitest";
import { matchProfileLocation, isVerifiedOwner } from "../src/shared/ownership";

describe("ownership by Google Business Profile", () => {
  const loc = (placeId: string | null, name = "locations/1") => ({ name, title: "Bakkerij", placeId });

  it("matches only the location with the business's place id", () => {
    const r = matchProfileLocation({ googlePlaceId: "ChIJ-real" }, [loc("ChIJ-other", "locations/9"), loc("ChIJ-real", "locations/2")]);
    expect(r).toEqual({ ok: true, location: loc("ChIJ-real", "locations/2") });
  });

  it("refuses a profile that holds some other business", () => {
    expect(matchProfileLocation({ googlePlaceId: "ChIJ-real" }, [loc("ChIJ-other")])).toEqual({ ok: false, reason: "no_match" });
    expect(matchProfileLocation({ googlePlaceId: "ChIJ-real" }, [loc(null)])).toEqual({ ok: false, reason: "no_match" });
  });

  it("cannot verify a business with no place id, or an account with no locations", () => {
    expect(matchProfileLocation({ googlePlaceId: null }, [loc(null)])).toEqual({ ok: false, reason: "no_place_id" });
    expect(matchProfileLocation({ googlePlaceId: "ChIJ-real" }, [])).toEqual({ ok: false, reason: "no_locations" });
  });

  it("a verified owner is the verified user, nobody else", () => {
    const b = { ownerVerifiedAt: "2026-10-10T00:00:00Z", ownerUserId: "u1" };
    expect(isVerifiedOwner(b, "u1")).toBe(true);
    expect(isVerifiedOwner(b, "u2")).toBe(false);
    expect(isVerifiedOwner({ ...b, ownerVerifiedAt: null }, "u1")).toBe(false);
  });
});
