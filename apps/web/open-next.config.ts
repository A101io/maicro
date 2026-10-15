import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/** OpenNext for Cloudflare Workers. No incremental cache yet: every page is rendered per request (the language comes from a request header). */
export default defineCloudflareConfig();
