import type { Metadata } from "next";
import { copy } from "@maicro/core/copy";
import { verifyUnsubscribeToken } from "@maicro/core/shared";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ready } from "@/lib/db";

export const metadata: Metadata = { title: copy.unsubscribe.h1, robots: { index: false } };
export const dynamic = "force-dynamic";

/** The opt-out link in the follow-up mails lands here; the button does the unsubscribing. */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ b?: string; t?: string; klaar?: string; fout?: string }> }) {
  const sp = await searchParams;
  const U = copy.unsubscribe;
  const valid = Boolean(sp.b && sp.t && verifyUnsubscribeToken(sp.b, sp.t));
  const business = valid ? await (await ready()).getBusiness(sp.b!) : null;
  return (
    <>
      <SiteHeader variant="minimal" />
      <main className="wrap max-w-[640px] py-16 sm:py-24">
        {sp.klaar === "1" ? (
          <div aria-live="polite">
            <h1 className="h2">{U.doneH1}</h1>
            <p className="lead mt-4">{U.doneBody}</p>
          </div>
        ) : valid && business ? (
          <>
            <h1 className="h2">{U.h1}</h1>
            <p className="lead mt-4">{U.body(business.name)}</p>
            <form action="/api/afmelden" method="post" className="mt-8">
              <input type="hidden" name="b" value={sp.b} />
              <input type="hidden" name="t" value={sp.t} />
              <button type="submit" className="btn-primary h-[52px] px-8">
                {U.button}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="h2">{U.h1}</h1>
            <p className="lead mt-4" aria-live="polite">
              {U.invalid}
            </p>
          </>
        )}
      </main>
      <SiteFooter variant="short" />
    </>
  );
}
