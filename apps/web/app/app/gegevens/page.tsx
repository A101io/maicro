import { copy } from "@maicro/core/copy";
import { requireOwner } from "@/lib/owner";
import { loadDashboard } from "@/lib/reads";
import { dateShort } from "@/lib/format";
import { FactsForm } from "./FactsForm";

export default async function FactsPage({ searchParams }: { searchParams: Promise<{ opgeslagen?: string; fout?: string }> }) {
  const sp = await searchParams;
  const { business } = await requireOwner("/app/gegevens");
  const { facts } = await loadDashboard(business.id);
  const F = copy.facts;
  const initial = facts ?? {
    businessId: business.id,
    version: 0,
    provisional: true,
    verifiedAt: null,
    name: business.name,
    place: business.place,
    address: null,
    postcode: null,
    phone: null,
    email: null,
    website: business.domain ? `https://${business.domain}` : null,
    openStatus: "open" as const,
    hours: [],
    servicesYes: [],
    servicesNo: [],
    prices: [],
    policies: [],
    paymentMethods: [],
    notConfusedWith: [],
  };
  return (
    <div className="space-y-6">
      <header>
        <h1 className="h2">{F.h1}</h1>
        <p className="mt-2 text-[17px]">{F.intro}</p>
        {sp.opgeslagen === "1" ? (
          <p className="mt-3 rounded-card border border-rule bg-white px-4 py-3 text-[15px]">{F.saved}</p>
        ) : initial.provisional ? (
          <p className="mono mt-3">{F.provisionalNotice}</p>
        ) : (
          <p className="mono mt-3">{F.verifiedNotice(dateShort(initial.verifiedAt ?? new Date()))}</p>
        )}
        {sp.fout === "1" && <p className="mt-3 text-[14px] text-wrong">{copy.errors.generic}</p>}
      </header>
      <FactsForm facts={initial} />
    </div>
  );
}
