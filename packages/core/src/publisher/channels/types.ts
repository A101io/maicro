/**
 * Common interface for every channel adapter (Google Business Profile, Bing
 * Places, Apple Business Connect, Dutch directories, facts page).
 */
import type { Channel, Facts } from "../../types.js";

export interface ChannelDiffEntry {
  field: string; // "phone" | "website" | "hours.0" | "address"
  current: string | null; // what the channel shows now
  expected: string | null; // what the facts say
}

export type SyncStatus = "synced" | "mismatch" | "pending" | "failed" | "manual" | "skipped";

export interface SyncResult {
  channelId: string;
  channelType: Channel["type"];
  status: SyncStatus;
  /** fields that differed before the sync; empty when already correct */
  diff: ChannelDiffEntry[];
  /** what we did and what we saw: request ids, screenshots, emails, timestamps */
  evidence: Record<string, unknown>;
  /** set when the adapter could not act itself and an operator or an email job must follow */
  followUp?: { kind: "operator_task" | "email"; payload: Record<string, unknown> };
  note?: string;
}

export interface ChannelAdapter {
  type: Channel["type"];
  syncChannel(channel: Channel, facts: Facts): Promise<SyncResult>;
}

/** Build the generic diff between a channel's current values and the facts. */
export function diffFacts(current: Partial<Record<string, string | null>>, facts: Facts): ChannelDiffEntry[] {
  const expected: Record<string, string | null> = {
    phone: facts.phone,
    website: facts.website,
    address: facts.address ? `${facts.address}, ${[facts.postcode, facts.place].filter(Boolean).join(" ")}` : null,
  };
  for (const h of facts.hours) {
    expected[`hours.${h.day}`] = h.closed || !h.open || !h.close ? "gesloten" : `${h.open}-${h.close}`;
  }
  const out: ChannelDiffEntry[] = [];
  for (const [field, exp] of Object.entries(expected)) {
    if (exp == null) continue;
    const cur = current[field] ?? null;
    if (normalise(cur) !== normalise(exp)) out.push({ field, current: cur, expected: exp });
  }
  return out;
}

function normalise(v: string | null): string {
  return (v ?? "").toLowerCase().replace(/\s+/g, "").replace(/^\+31/, "0").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
