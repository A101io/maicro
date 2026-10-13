import { getI18n } from "@/lib/i18n";
import { isVerifiedOwner } from "@vidalo/core/shared";
import { Stip } from "@/components/Stip";
import { requireOwner } from "@/lib/owner";
import { loadDashboard } from "@/lib/reads";
import { env } from "@/lib/env";
import { dateShort } from "@/lib/format";

export default async function GooglePage({ searchParams }: { searchParams: Promise<{ gekoppeld?: string; eerst?: string }> }) {
  const sp = await searchParams;
  const { business, session } = await requireOwner("/app/google");
  const { channels } = await loadDashboard(business.id);
  const gbp = channels.find((c) => c.type === "gbp");
  const verified = isVerifiedOwner(business, session.userId);
  const { copy } = await getI18n();
  const G = copy.google;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="h2">{G.h1}</h1>
        <p className="mt-2 max-w-[60ch] text-[17px] text-ink-2">{G.intro}</p>
      </header>
      {sp.eerst === "1" && !verified && (
        <p className="card p-4 text-[15px] text-ink-2" aria-live="polite">
          {G.needsVerification}
        </p>
      )}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold">{copy.result.sources.rows.gbp}</span>
          <span className="inline-flex items-center gap-2 text-[14px] text-muted">
            <Stip tone={verified ? "groen" : "grijs"} />
            {verified ? G.verified(dateShort(business.ownerVerifiedAt!)) : G.disconnected}
          </span>
        </div>
        {verified && gbp?.lastSyncedAt && <p className="mt-3 text-[14px] text-muted">{G.connected(dateShort(gbp.lastSyncedAt))}</p>}
        {!verified && (
          <>
            <a href="/api/google/start" className="btn-primary mt-5 h-[52px]">
              {G.button}
            </a>
            <p className="mt-4 text-[14px] text-muted">{G.permissions}</p>
            {!env.hasGoogle && <p className="mt-1 text-[14px] text-muted">{G.mockHint}</p>}
          </>
        )}
      </section>
    </div>
  );
}
