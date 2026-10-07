import { describe, expect, it } from "vitest";
import { amsterdamParts, amsterdamToUtc, monthlySlot } from "../src/cron";

describe("cron time helpers", () => {
  it("converts Amsterdam wall-clock to UTC across DST", () => {
    // CEST (UTC+2) in July, CET (UTC+1) in January
    expect(amsterdamToUtc(2026, 7, 15, 2, 0).toISOString()).toBe("2026-07-15T00:00:00.000Z");
    expect(amsterdamToUtc(2026, 1, 15, 2, 0).toISOString()).toBe("2026-01-15T01:00:00.000Z");
    expect(amsterdamParts(new Date("2026-07-15T00:30:00Z"))).toMatchObject({ y: 2026, m: 7, d: 15, hh: 2, mm: 30 });
  });

  it("spreads monthly scans over 02:00–06:00 local, deterministic per business", () => {
    const now = new Date("2026-10-07T00:00:00Z"); // 02:00 CEST
    const a = monthlySlot({ id: "11111111-aaaa" }, now);
    const b = monthlySlot({ id: "22222222-bbbb" }, now);
    for (const slot of [a, b]) {
      const p = amsterdamParts(slot);
      expect(p.hh).toBeGreaterThanOrEqual(2);
      expect(p.hh).toBeLessThan(6);
      expect(p.d).toBe(7);
    }
    expect(monthlySlot({ id: "11111111-aaaa" }, now).getTime()).toBe(a.getTime());
    // when the window has passed the slot is "now"
    const late = new Date("2026-10-07T12:00:00Z");
    expect(monthlySlot({ id: "11111111-aaaa" }, late).getTime()).toBe(late.getTime());
  });
});
