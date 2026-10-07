import { copy } from "@maicro/core/copy";
import { Chip } from "@/components/FindingCard";
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
        <p className="mt-2 max-w-[60ch] text-[17px]">{G.intro}</p>
      </header>
      <section className="card p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="font-medium">Google Bedrijfsprofiel</span>
          {connected ? <Chip tone="ok">{G.connected(dateShort(gbp?.lastSyncedAt ?? new Date()))}</Chip> : <Chip tone="neutral">{G.disconnected}</Chip>}
        </div>
        {!connected && (
          <>
            <a href="/api/google/start" className="btn-primary mt-5 no-underline hover:no-underline">
              {G.button}
            </a>
            <p className="mono mt-4">{G.permissions}</p>
            {!env.hasGoogle && <p className="mono mt-1">{G.mockHint}</p>}
          </>
        )}
        {sp.fout === "1" && <p className="mt-3 text-[14px] text-wrong">{copy.errors.generic}</p>}
      </section>
    </div>
  );
}
