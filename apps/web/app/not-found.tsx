import Link from "next/link";
import { copy } from "@maicro/core/copy";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader variant="minimal" />
      <main className="wrap max-w-[760px] py-16">
        <h1 className="h2">{copy.errors.notFound}</h1>
        <p className="mt-4">
          <Link href="/" className="btn-link">{copy.scan.choose.back}</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
