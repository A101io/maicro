import Link from "next/link";
import { getI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default async function NotFound() {
  const { copy, href } = await getI18n();
  return (
    <>
      <SiteHeader variant="minimal" />
      <main className="wrap max-w-[760px] py-16">
        <h1 className="h2">{copy.errors.notFound}</h1>
        <p className="mt-4">
          <Link href={href("/")} className="btn-link">{copy.scan.choose.back}</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
