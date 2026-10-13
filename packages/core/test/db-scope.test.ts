import { describe, expect, it } from "vitest";
import { MemDb } from "../src/db";
import { getDb, setDb, withDb } from "../src/shared";

// Cloudflare Workers cannot reuse a connection across requests, so each
// request runs inside withDb with its own handle (apps/web/worker.ts).
describe("withDb", () => {
  it("gives code inside the scope the scoped handle, and the shared one outside", async () => {
    const shared = new MemDb();
    const scoped = new MemDb();
    setDb(shared);
    expect(getDb()).toBe(shared);
    await withDb(scoped, async () => {
      await Promise.resolve();
      expect(getDb()).toBe(scoped);
      await new Promise((r) => setTimeout(r, 5));
      expect(getDb()).toBe(scoped); // survives timers, as a streamed render does
    });
    expect(getDb()).toBe(shared);
    setDb(null);
  });

  it("keeps two concurrent requests apart", async () => {
    const a = new MemDb();
    const b = new MemDb();
    const seen: string[] = [];
    await Promise.all([
      withDb(a, async () => {
        await new Promise((r) => setTimeout(r, 10));
        seen.push(getDb() === a ? "a" : "wrong");
      }),
      withDb(b, async () => {
        seen.push(getDb() === b ? "b" : "wrong");
      }),
    ]);
    expect(seen.sort()).toEqual(["a", "b"]);
  });

  it("is one scope per isolate, whichever copy of the module opened it", () => {
    // The Worker entry and the Next server bundle core separately; both must find the same store.
    expect((globalThis as { __maicroDbScope?: unknown }).__maicroDbScope).toBeDefined();
  });
});
