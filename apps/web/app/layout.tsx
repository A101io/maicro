import type { Metadata, Viewport } from "next";
import "./globals.css";
import { copy } from "@maicro/core/copy";

export const metadata: Metadata = {
  title: { default: `${copy.brand}: ${copy.landing.hero.h1}`, template: `%s · ${copy.brand}` },
  description: copy.landing.hero.sub,
  metadataBase: new URL(process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "light", themeColor: "#F6F4EE" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Instrument+Serif:ital@0;1&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
