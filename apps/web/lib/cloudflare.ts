import { getCloudflareContext } from "@opennextjs/cloudflare";

/** What the web Worker is bound to (apps/web/wrangler.jsonc). */
interface WebBindings {
  SCAN_QUEUE?: { send(body: ScanMessage): Promise<void> };
}

/** A free scan handed to the background worker (apps/worker/src/cloudflare.ts). */
export interface ScanMessage {
  token: string;
  kind: "free";
  engines: string[];
}

/** The Cloudflare bindings, or null when not running on Cloudflare (next dev, next start, tests). */
export function cloudflareBindings(): WebBindings | null {
  try {
    return getCloudflareContext().env as WebBindings;
  } catch {
    return null;
  }
}
