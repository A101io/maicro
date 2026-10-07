import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@maicro/core"],
  experimental: { serverActions: { bodySizeLimit: "1mb" } },
  serverExternalPackages: ["postgres"],
  webpack: (config) => {
    // packages/core uses Node-ESM style "./x.js" imports that resolve to .ts files.
    config.resolve.extensionAlias = { ".js": [".ts", ".tsx", ".js"], ".mjs": [".mts", ".mjs"] };
    return config;
  },
};

export default nextConfig;
