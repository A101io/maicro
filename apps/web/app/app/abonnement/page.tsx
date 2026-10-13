import { getI18n } from "@/lib/i18n";
import { isVerifiedOwner } from "@maicro/core/shared";
import { Stip } from "@/components/Stip";
import { requireOwner } from "@/lib/owner";
import { ready } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { dateShort } from "@/lib/format";

/** Next renewal date from Stripe, when there is a subscription and a key. */
async function nextPayment(subscriptionId: string | null): Promise<string | null> {
  const stripe = subscriptionId ? await getStripe() : null;
  if (!stripe || !subscriptionId) return null;
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    // The period end moved from the subscription to its items in newer API versions; read either.
    const s = sub as unknown as { current_period_end?: number; items?: { data?: { current_period_end?: number }[] } };
    const end = s.current_period_end ?? s.items?.data?.[0]?.current_period_end;
    return end ? dateShort(new Date(end * 1000)) : null;
  } catch {
    return null;
  }
}

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ toegevoegd?: string }> }) {
  const sp = await searchParams;
  const { business, session } = await requireOwner("/app/abonnement");
  const { copy } = await getI18n();
  const B = copy.billing;
  const events = await (await ready()).listEvents(business.id, 200);
  const lastPay = events.find((e) => e.type === "payment.processing" || e.type === "checkout.completed" || e.type === "checkout.mock");
  const processing = lastPay?.type === "payment.processing";
  const next = await nextPayment(business.stripeSubscriptionId);
  const tone = business.status === "paused" ? "rood" : business.status === "trial" || business.status === "active" ? "groen" : "grijs";
  const canAdd = business.plan === "setup" && (business.status === "trial" || business.status === "active") && isVerifiedOwner(business, session.userId);
  return (
    <div className="space-y-6">
      <h1 className="h2">{B.h1}</h1>
      {sp.toegevoegd === "1" && (
        <p className="card p-4 text-[15px]" aria-live="polite">
          {copy.billing.addonDone}
        </p>
      )}
      {(processing || business.status === "paused") && (
        <p className="rounded-2xl bg-panel p-4 text-[15px] text-ink-2" aria-live="polite">
          {processing ? B.processing : B.pausedNote}
        </p>
      )}
      <section className="card divide-y-[1.5px] divide-line">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <span className="text-[14px] text-muted">{B.planLabel}</span>
          <span className="font-semibold">{B.plans[business.plan]}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <span className="text-[14px] text-muted">{B.statusLabel}</span>
          <span className="inline-flex items-center gap-2 font-semibold">
            <Stip tone={tone} /> {B.statuses[business.status]}
          </span>
        </div>
        {next && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <span className="text-[14px] text-muted">{B.nextLabel}</span>
            <span className="font-semibold">{next}</span>
          </div>
        )}
      </section>
      {canAdd && (
        <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="h3">{B.addonTitle}</h2>
            <p className="mt-1 max-w-[52ch] text-[15px] text-ink-2">{B.addonBody}</p>
          </div>
          <form action="/api/checkout" method="post">
            <input type="hidden" name="business" value={business.id} />
            <input type="hidden" name="plan" value="monitor_addon" />
            <button type="submit" className="btn-primary h-[52px] px-6">
              {B.addonButton}
            </button>
          </form>
        </section>
      )}
      {business.plan !== "none" && (
        <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="h3">{B.portal}</h2>
            <p className="mt-1 max-w-[52ch] text-[15px] text-muted">{B.portalNote}</p>
          </div>
          <form action="/api/billing/portal" method="post">
            <button type="submit" className="btn-sm">
              {copy.dashboard.openPortal}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
