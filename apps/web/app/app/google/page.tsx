import { copy } from "@maicro/core/copy";
import { Stip } from "@/components/Stip";
import { requireOwner } from "@/lib/owner";
import { loadDashboard } from "@/lib/reads";
import { env } from "@/lib/env";
import { dateShort } from "@/lib/format";

export default async function GooglePage({ searchParams }: { searchParams: Promise<{ gekoppeld?: string; fout?: string }> }) {
  const sp = await searchParams;
  const { business } = await requireOwner("/app/google");
  const { channels } = await loadDashboard(business.id);
  const gbp = channels.find((c) => c.type === "gbp");
  const connected = Boolean(gbp && gbp.status !== "pending") || sp.gekoppeld === "1";
  const G = copy.google;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="h2">{G.h1}</h1>
        <p className="mt-2 max-w-[60ch] text-[17px] text-ink-2">{G.intro}</p>
      </header>
      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold">{copy.result.sources.rows.gbp}</span>
          <span className="inline-flex items-center gap-2 text-[14px] text-muted"><Stip tone={connected ? "groen" : "grijs"} />{connected ? G.connected(dateShort(gbp?.lastSyncedAt ?? new Date())) : G.disconnected}</span>
        </div>
        {!connected && (
          <>
            <a href="/api/google/start" className="btn-primary mt-5 h-[52px]">
              {G.button}
            </a>
            <p className="mt-4 text-[14px] text-muted">{G.permissions}</p>
            {!env.hasGoogle && <p className="mt-1 text-[14px] text-muted">{G.mockHint}</p>}
          </>
        )}
        {sp.fout === "1" && <p className="mt-3 text-[14px] text-rood">{copy.errors.generic}</p>}
      </section>
    </div>
  );
}
