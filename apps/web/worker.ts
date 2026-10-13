/**
 * The web Worker's entry: OpenNext's handler, with a database handle of its
 * own for every request. On Workers a connection opened during one request
 * cannot be used by the next, so the process-wide handle that serves Node
 * (dev, tests) would fail from the second request on. Hyperdrive, when bound,
 * pools the real connections; without it the handle connects directly.
 * Mock mode keeps the in-memory database and needs none of this.
 *
 * Not in tsconfig: it imports the build output (.open-next), which exists only
 * after `opennextjs-cloudflare build`; wrangler bundles it with esbuild.
 */
import handler from "./.open-next/worker.js";
import { createDb } from "@maicro/core/db";
import { withDb } from "@maicro/core/shared";

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

interface Env {
  HYPERDRIVE?: { connectionString: string };
  MAICRO_MOCK?: string;
  MAICRO_DB?: string;
  DATABASE_URL?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }): Promise<Response> {
    // Postgres unless plain mock mode; MAICRO_DB=pg is mock engines on a real database (as in core).
    const postgres = env.MAICRO_MOCK !== "1" || env.MAICRO_DB === "pg";
    const url = postgres ? (env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL ?? null) : null;
    if (!url) return handler.fetch(request, env, ctx);
    // Few connections, closed shortly after the last query: the next request opens its own.
    const db = createDb(url, { max: 3, idleTimeout: 5 });
    return withDb(db, () => handler.fetch(request, env, ctx));
  },
};
