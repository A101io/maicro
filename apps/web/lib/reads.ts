/**
 * Dashboard reads. With Supabase configured these run as the signed-in user
 * through the anon client, so RLS (supabase/migrations/0001_init.sql) decides
 * what is visible. Without Supabase they fall back to the service db (mock).
 */
import type { Channel, Facts, Finding, ScanRun } from "@maicro/core/types";
import { createServerSupabase } from "./supabase";
import { ready } from "./core";

export interface DashboardData {
  facts: Facts | null;
  findings: Finding[];
  channels: Channel[];
  scanRuns: ScanRun[];
}

type Row = Record<string, unknown>;

function camel(row: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) out[k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] = v;
  return out;
}

export async function loadDashboard(businessId: string): Promise<DashboardData> {
  const supabase = await createServerSupabase();
  if (!supabase) {
    const db = await ready();
    const [facts, findings, channels, scanRuns] = await Promise.all([db.latestFacts(businessId), db.listFindings(businessId), db.listChannels(businessId), db.listScanRuns(businessId, 12)]);
    return { facts, findings, channels, scanRuns };
  }
  const [factsRes, findingsRes, channelsRes, runsRes] = await Promise.all([
    supabase.from("facts").select("*").eq("business_id", businessId).order("version", { ascending: false }).limit(1),
    supabase.from("finding").select("*").eq("business_id", businessId).order("first_seen_at", { ascending: false }),
    supabase.from("channel").select("*").eq("business_id", businessId),
    supabase.from("scan_run").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(12),
  ]);
  const factsRow = (factsRes.data?.[0] ?? null) as Row | null;
  const facts = factsRow
    ? ({ ...(factsRow.data as Row), businessId, version: factsRow.version, provisional: factsRow.provisional, verifiedAt: factsRow.verified_at ?? null } as unknown as Facts)
    : null;
  return {
    facts,
    findings: ((findingsRes.data ?? []) as Row[]).map(camel) as unknown as Finding[],
    channels: ((channelsRes.data ?? []) as Row[]).map(camel) as unknown as Channel[],
    scanRuns: ((runsRes.data ?? []) as Row[]).map(camel) as unknown as ScanRun[],
  };
}
