import { getI18n } from "@/lib/i18n";
import { requireVerifiedOwner } from "@/lib/owner";
import { factsHostFor, cnameTarget } from "@/lib/factsPage";
import { registerDomain } from "../actions";

export default async function DomainPage({ searchParams }: { searchParams: Promise<{ dns?: string; registreren?: string }> }) {
  const sp = await searchParams;
  const { business } = await requireVerifiedOwner("/app/domein");
  const { copy } = await getI18n();
  const D = copy.domain;
  const host = business.domain ? factsHostFor(business) : null;
  const verified = Boolean(business.factsHostVerifiedAt) || sp.dns === "ok";
  return (
    <div className="space-y-6">
      <header>
        <h1 className="h2">{D.h1}</h1>
        <p className="mt-2 max-w-[60ch] text-[17px] text-ink-2">{D.intro}</p>
      </header>

      <section className="card p-5 sm:p-6">
        <h2 className="h3">{D.optionA}</h2>
        {host ? (
          <>
            <p className="mt-2 text-[15px]">{D.optionAHint}</p>
            <table className="mt-3 w-full text-[14px]">
              <thead className="text-left text-muted">
                <tr>
                  <th className="py-1 pr-4 font-normal">{D.recordType}</th>
                  <th className="py-1 pr-4 font-normal">{D.recordName}</th>
                  <th className="py-1 font-normal">{D.recordValue}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t-[1.5px] border-line">
                  <td className="py-2 pr-4">CNAME</td>
                  <td className="py-2 pr-4 break-all">{host}</td>
                  <td className="py-2 break-all">{cnameTarget()}</td>
                </tr>
              </tbody>
            </table>
            {verified ? (
              <p className="mt-4 text-[15px]">{D.verified(host)}</p>
            ) : (
              <>
                {sp.dns === "nee" && <p className="mt-4 text-[15px] text-muted">{D.notYet}</p>}
                <form action="/api/domain/verify" method="post" className="mt-4">
                  <input type="hidden" name="host" value={host} />
                  <button type="submit" className="btn-primary h-[52px]">
                    {D.checkButton}
                  </button>
                </form>
              </>
            )}
          </>
        ) : (
          <p className="mt-2 text-[15px] text-muted">{D.noDomain}</p>
        )}
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="h3">{D.optionB}</h2>
        <p className="mt-2 text-[15px]">{D.optionBHint(`${business.slug}.nl`)}</p>
        {sp.registreren === "ingepland" ? (
          <p className="mt-3 text-[15px]">{D.optionBQueued}</p>
        ) : (
          <form action={registerDomain} className="mt-4">
            <button type="submit" className="btn-sm">
              {D.optionBButton}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
