import type { NextConfig } from "next";

/**
 * Security headers on every response (baseline D7). The CSP is production
 * only: the dev server needs eval for hot reload. 'unsafe-inline' for
 * scripts stays until Next's inline bootstrap gets a nonce; everything else
 * is locked to this origin, Supabase (auth) and the two places a form or
 * redirect may go: Stripe Checkout and Google sign-in.
 */
const supabase = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : "https://*.supabase.co";
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabase}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self' https://checkout.stripe.com https://accounts.google.com",
  // Only on https: on an http origin (a local production build) it rewrites
  // the form's own http URL to https, which is then not 'self', and the scan
  // form silently stops submitting.
  ...((process.env.PUBLIC_BASE_URL ?? "").startsWith("https://") ? ["upgrade-insecure-requests"] : []),
].join("; ");
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.stripe.com\")" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  transpilePackages: ["@maicro/core"],
  experimental: { serverActions: { bodySizeLimit: "1mb" } },
  serverExternalPackages: ["postgres"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  webpack: (config) => {
    // packages/core uses Node-ESM style "./x.js" imports that resolve to .ts files.
    config.resolve.extensionAlias = { ".js": [".ts", ".tsx", ".js"], ".mjs": [".mts", ".mjs"] };
    return config;
  },
};

export default nextConfig;
