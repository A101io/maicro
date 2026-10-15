import Link from "next/link";
import { getI18n } from "@/lib/i18n";
import { JsonLd, breadcrumbLd, organizationLd } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Slot } from "@/components/LandingSections";

/**
 * The frame of an explainer page (/waarom, /hoe-het-werkt, /straks): a
 * breadcrumb, one h1 with an intro, the sections, and the check at the end.
 */
export async function ExplainerPage({ page, route, children, ld = [] }: { page: "why" | "how" | "next"; route: string; children: React.ReactNode; ld?: object[] }) {
  const { copy, lang, href } = await getI18n();
  const P = copy.pages[page];
  return (
    <>
      <JsonLd data={[organizationLd(copy), breadcrumbLd(copy, lang, [{ name: P.crumb, route }]), ...ld]} />
      <SiteHeader />
      <main>
        <section className="hero-glow wrap flex flex-col gap-5 pb-12 pt-8 sm:pb-16 sm:pt-12">
          <nav aria-label="Breadcrumb" className="text-[14px] text-muted">
            <Link href={href("/")} className="hover:text-ink">
              {copy.pages.home_crumb}
            </Link>
            <span aria-hidden> / </span>
            <span aria-current="page">{P.crumb}</span>
          </nav>
          <h1 className="h1 enter max-w-[20ch]">{P.h1}</h1>
          <p className="lead enter max-w-[60ch]" style={{ "--d": "90ms" } as React.CSSProperties}>
            {P.intro}
          </p>
        </section>
        {children}
        <Slot />
      </main>
      <SiteFooter />
    </>
  );
}
