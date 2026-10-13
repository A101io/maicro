import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import "./scenes.css";
import { copy } from "@maicro/core/copy";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${copy.brand}: ${copy.landing.hero.h1}`, template: `%s · ${copy.brand}` },
  description: copy.tagline,
  metadataBase: new URL(process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "light", themeColor: "#FFFFFF" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={manrope.variable}>
      <body className="font-sans">
        {children}
        {/* Scroll motion; hides nothing on its own, so the page is whole without it. */}
        <script src="/motion.js" defer />
      </body>
    </html>
  );
}
