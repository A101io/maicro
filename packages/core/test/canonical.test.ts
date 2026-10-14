import { describe, expect, it } from "vitest";
import { canonicalRedirect, REDIRECT_HOSTS } from "../src/shared/canonical.js";

describe("canonicalRedirect", () => {
  it("sends www to the same path on vidalo.io", () => {
    for (const host of REDIRECT_HOSTS) {
      expect(canonicalRedirect(`https://${host}/prijzen?x=1`)).toBe("https://vidalo.io/prijzen?x=1");
    }
    expect(canonicalRedirect("http://WWW.VIDALO.IO/en/pricing")).toBe("https://vidalo.io/en/pricing");
  });

  it("leaves vidalo.io, workers.dev and localhost alone", () => {
    expect(canonicalRedirect("https://vidalo.io/prijzen")).toBeNull();
    expect(canonicalRedirect("https://vidalo-web.julian-devriend.workers.dev/")).toBeNull();
    expect(canonicalRedirect("http://localhost:3000/")).toBeNull();
  });

  it("does not redirect a host it does not know (control: a lookalike is not ours)", () => {
    expect(canonicalRedirect("https://vidalo.io.example.com/")).toBeNull();
    expect(canonicalRedirect("https://feiten.vidalo.io/")).toBeNull();
  });
});
