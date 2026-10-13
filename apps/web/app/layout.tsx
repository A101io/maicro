import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import "./scenes.css";
import { getCopy, getLang, getRoute, localizeHref } from "@/lib/i18n";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const [copy, route] = [await getCopy(), await getRoute()];
  return {
    title: { default: `${copy.brand}: ${copy.landing.hero.h1}`, template: `%s · ${copy.brand}` },
    description: copy.tagline,
    metadataBase: new URL(process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"),
    // Every page exists in both languages (baseline F1: hreflang).
    alternates: { languages: { nl: localizeHref(route, "nl"), en: localizeHref(route, "en"), "x-default": localizeHref(route, "nl") } },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "light", themeColor: "#FFFFFF" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={manrope.variable}>
      <body className="font-sans">
        {children}
        {/* Scroll motion; hides nothing on its own, so the page is whole without it. */}
        <script src="/motion.js" defer />
        <script src="/ask.js" defer />
      </body>
    </html>
  );
}
