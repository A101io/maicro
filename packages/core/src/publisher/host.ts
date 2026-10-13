/**
 * Facts host logic.
 *
 * Preferred: `feiten.{domain}` on the owner's own domain, pointed at Vidalo with
 * one CNAME record. Fallback: `{slug}.feiten.{FACTS_HOST_SUFFIX}`.
 *
 * Cloudflare for SaaS (custom hostnames) is used when CLOUDFLARE_API_TOKEN and
 * CLOUDFLARE_ZONE_ID are set; otherwise every call is a logged no-op so the
 * whole flow runs in MAICRO_MOCK=1 without keys. In mock mode DNS lookups are
 * skipped and report success (set MAICRO_MOCK_DNS_OK=0 to force a real lookup).
 */
import { resolveCname } from "node:dns/promises";
import type { Business } from "../types.js";
import { defaultFactsHost } from "./render.js";

export { defaultFactsHost };

export function factsHostSuffix(): string {
  return process.env.FACTS_HOST_SUFFIX || "maicro.nl";
}

/** The CNAME target an owner must point `feiten.{domain}` at. */
export function cnameTarget(): string {
  return process.env.FACTS_CNAME_TARGET || `feiten.${factsHostSuffix()}`;
}

/** Strip protocol/path/www from a stored domain. */
export function bareDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[/:?#].*$/, "");
}

/** `feiten.{domain}` when the business has a domain, else the fallback host. */
export function preferredFactsHost(business: Pick<Business, "slug" | "domain">): string {
  if (business.domain) return `feiten.${bareDomain(business.domain)}`;
  return defaultFactsHost(business);
}

/** True when the host is on our own suffix (no DNS verification needed). */
export function isFallbackHost(host: string): boolean {
  return host.endsWith(`.feiten.${factsHostSuffix()}`);
}

export interface CnameCheck {
  host: string;
  ok: boolean;
  found: string[];
  expected: string;
  error?: string;
}

/**
 * Verify that `host` has a CNAME pointing at `expectedTarget` (or at any name
 * that itself resolves to the target, one hop).
 */
export async function verifyCname(host: string, expectedTarget = cnameTarget()): Promise<CnameCheck> {
  const expected = expectedTarget.toLowerCase().replace(/\.$/, "");
  if (process.env.MAICRO_MOCK === "1" && process.env.MAICRO_MOCK_DNS_OK !== "0") {
    console.log(JSON.stringify({ msg: "dns.verify.mock", host, expected }));
    return { host, ok: true, found: [expected], expected };
  }
  try {
    const found = (await resolveCname(host)).map((c) => c.toLowerCase().replace(/\.$/, ""));
    if (found.includes(expected)) return { host, ok: true, found, expected };
    // one hop: the CNAME may point at a name that is itself a CNAME to our target
    for (const f of found) {
      try {
        const hop = (await resolveCname(f)).map((c) => c.toLowerCase().replace(/\.$/, ""));
        if (hop.includes(expected)) return { host, ok: true, found: [...found, ...hop], expected };
      } catch {
        /* ignore */
      }
    }
    return { host, ok: false, found, expected };
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    return { host, ok: false, found: [], expected, error: e.code ?? e.message };
  }
}

// ---------------------------------------------------------------------------
// Cloudflare for SaaS custom hostnames
// ---------------------------------------------------------------------------

export interface CustomHostnameStatus {
  id: string | null;
  hostname: string;
  status: "active" | "pending" | "moved" | "deleted" | "unknown" | "mock";
  sslStatus: string | null;
  raw?: unknown;
}

function cfConfig(): { token: string; zoneId: string } | null {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  if (!token || !zoneId) return null;
  return { token, zoneId };
}

async function cf<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cfg = cfConfig();
  if (!cfg) throw new Error("cloudflare not configured");
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfg.zoneId}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${cfg.token}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = (await res.json()) as { success: boolean; result: T; errors?: unknown[] };
  if (!res.ok || !body.success) {
    throw new Error(`cloudflare ${path} failed: ${res.status} ${JSON.stringify(body.errors ?? body)}`);
  }
  return body.result;
}

interface CfHostname {
  id: string;
  hostname: string;
  status: string;
  ssl?: { status?: string };
}

/** Create (or fetch existing) custom hostname. No-op with a log when not configured. */
export async function ensureCustomHostname(hostname: string): Promise<CustomHostnameStatus> {
  if (!cfConfig()) {
    console.log(JSON.stringify({ msg: "cloudflare.custom_hostname.skip", hostname, reason: "no CLOUDFLARE_API_TOKEN/ZONE_ID" }));
    return { id: null, hostname, status: "mock", sslStatus: null };
  }
  const existing = await cf<CfHostname[]>(`/custom_hostnames?hostname=${encodeURIComponent(hostname)}`);
  const found = existing[0];
  if (found) return toStatus(found);
  const created = await cf<CfHostname>(`/custom_hostnames`, {
    method: "POST",
    body: JSON.stringify({ hostname, ssl: { method: "http", type: "dv", settings: { min_tls_version: "1.2" } } }),
  });
  return toStatus(created);
}

export async function customHostnameStatus(hostname: string): Promise<CustomHostnameStatus> {
  if (!cfConfig()) {
    return { id: null, hostname, status: "mock", sslStatus: null };
  }
  const existing = await cf<CfHostname[]>(`/custom_hostnames?hostname=${encodeURIComponent(hostname)}`);
  const found = existing[0];
  if (!found) return { id: null, hostname, status: "unknown", sslStatus: null };
  return toStatus(found);
}

export async function deleteCustomHostname(hostname: string): Promise<void> {
  if (!cfConfig()) {
    console.log(JSON.stringify({ msg: "cloudflare.custom_hostname.delete.skip", hostname }));
    return;
  }
  const existing = await cf<CfHostname[]>(`/custom_hostnames?hostname=${encodeURIComponent(hostname)}`);
  const found = existing[0];
  if (!found) return;
  await cf(`/custom_hostnames/${found.id}`, { method: "DELETE" });
}

function toStatus(h: CfHostname): CustomHostnameStatus {
  const status = (["active", "pending", "moved", "deleted"] as const).find((s) => s === h.status) ?? "unknown";
  return { id: h.id, hostname: h.hostname, status, sslStatus: h.ssl?.status ?? null, raw: h };
}

/**
 * Full host verification step used by the cron poll:
 * fallback hosts are always verified; custom hosts need a CNAME and (when
 * configured) an active Cloudflare custom hostname.
 */
export async function checkFactsHost(host: string): Promise<{ verified: boolean; cname: CnameCheck | null; cloudflare: CustomHostnameStatus | null }> {
  if (isFallbackHost(host)) return { verified: true, cname: null, cloudflare: null };
  const cname = await verifyCname(host);
  if (!cname.ok) return { verified: false, cname, cloudflare: null };
  const cloudflare = await ensureCustomHostname(host);
  const verified = cloudflare.status === "active" || cloudflare.status === "mock";
  return { verified, cname, cloudflare };
}
