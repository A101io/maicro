/**
 * After a deploy: fetch the live site and check the things that must be true.
 * Prints what it saw for every check, so a red run says why (Sitty's first
 * diagnosis of a failing check was wrong because it only said "failed").
 *
 *   node scripts/verify-deploy.mjs https://vidalo-web-preview.julian-devriend.workers.dev
 */
const base = (process.argv[2] ?? "").replace(/\/$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("usage: verify-deploy.mjs https://host");
  process.exit(2);
}

const checks = [
  { path: "/api/health", want: (s, t) => s === 200 && /"ok":true/.test(t), what: "health 200 ok" },
  { path: "/", want: (s, t) => s === 200 && /<html lang="nl"/.test(t) && /data-ask/.test(t), what: "Dutch landing with the simulator" },
  { path: "/en", want: (s, t) => s === 200 && /<html lang="en"/.test(t), what: "English landing" },
  { path: "/en/pricing", want: (s, t) => s === 200 && /<html lang="en"/.test(t), what: "English pricing" },
  { path: "/llms.txt", want: (s, t) => s === 200 && t.startsWith("# Vidalo"), what: "llms.txt" },
  { path: "/sitemap.xml", want: (s, t) => s === 200 && /hreflang/.test(t), what: "sitemap with hreflang" },
  { path: "/deze-pagina-bestaat-niet", want: (s) => s === 404, what: "unknown page 404" },
];

let failed = 0;
for (const c of checks) {
  let status = 0;
  let text = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(base + c.path, { redirect: "manual", headers: { "user-agent": "vidalo-deploy-verify" } });
      status = res.status;
      text = await res.text();
      if (c.want(status, text)) break;
    } catch (err) {
      text = String(err);
    }
    await new Promise((r) => setTimeout(r, attempt * 3000));
  }
  const ok = c.want(status, text);
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✗"} ${c.path.padEnd(28)} ${String(status).padEnd(4)} ${String(text.length).padStart(7)} bytes  ${c.what}${ok ? "" : `  | saw: ${text.slice(0, 160).replace(/\s+/g, " ")}`}`);
}
if (failed) {
  console.error(`\n${failed} check(s) failed on ${base}`);
  process.exit(1);
}
console.log(`\nAll checks passed on ${base}`);
