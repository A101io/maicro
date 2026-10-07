import { redirect } from "next/navigation";
import { copy } from "@maicro/core/copy";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { env } from "@/lib/env";
import { getSession } from "@/lib/session";
import { sendMagicLink } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; business?: string; sent?: string; fout?: string }> }) {
  const sp = await searchParams;
  if (sp.fout !== "geen" && (await getSession())) redirect(sp.next ?? "/app");
  const a = copy.auth;
  return (
    <>
      <SiteHeader minimal />
      <main className="container max-w-[520px] py-12 sm:py-16">
        <h1 className="h2">{a.h1}</h1>
        {sp.sent === "1" ? (
          <p className="mt-4 text-[17px]">{a.sent}</p>
        ) : (
          <>
            <p className="mt-3 text-[17px]">{a.body}</p>
            <form action={sendMagicLink} className="mt-6">
              <input type="hidden" name="next" value={sp.next ?? "/app"} />
              <input type="hidden" name="business" value={sp.business ?? ""} />
              <label htmlFor="email" className="label">
                {a.label}
              </label>
              <input id="email" name="email" type="email" required autoComplete="email" className="field" placeholder={copy.result.email.placeholder} />
              {sp.fout === "geen" && <p className="mt-2 text-[14px] text-wrong">{a.noBusiness}</p>}
              {sp.fout === "1" && <p className="mt-2 text-[14px] text-wrong">{copy.errors.generic}</p>}
              <button type="submit" className="btn-primary mt-4 w-full">
                {a.button}
              </button>
            </form>
            {!env.hasSupabase && <p className="mono mt-4">{a.mockHint}</p>}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
