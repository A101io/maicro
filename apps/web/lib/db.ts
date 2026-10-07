/**
 * Service-role database access for route handlers and server actions
 * (writes). Dashboard reads go through the user's Supabase client (RLS) in
 * lib/reads.ts, falling back to this in mock mode.
 */
import { getDb, ready } from "./core";
import type { Db } from "./core";

export function serviceDb(): Db {
  return getDb();
}

export { getDb, ready };
export type { Db };
export type { BusinessRecord } from "@maicro/core/db";
