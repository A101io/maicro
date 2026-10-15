/**
 * Fails when a tracked file contains something that looks like a real secret
 * (baseline A5). Runs in CI and as `pnpm scan:secrets`. Placeholders such as
 * "sk_test_..." in docs are allowed: a match needs real key material.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PATTERNS = [
  ["Stripe secret key", /\b(sk|rk)_(live|test)_[A-Za-z0-9]{20,}/],
  ["Stripe webhook secret", /\bwhsec_[A-Za-z0-9]{20,}/],
  ["OpenAI key", /\bsk-(proj-)?[A-Za-z0-9_-]{32,}/],
  ["Anthropic key", /\bsk-ant-[A-Za-z0-9_-]{32,}/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Resend key", /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{16,}/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{36,}/],
  ["Private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["Supabase service-role JWT", /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]*cm9sZSI6InNlcnZpY2Vfcm9sZS[A-Za-z0-9_-]*\.[A-Za-z0-9_-]{20,}/],
  ["Postgres URL with password", /postgres(ql)?:\/\/[^:\s"']+:(?!postgres@|password@|\[)[^@\s"']{8,}@(?!localhost|127\.0\.0\.1)/],
];

const files = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter((f) => f && !/\.(png|jpe?g|gif|webp|ico|woff2?|mp4|pdf|lock)$|pnpm-lock\.yaml$/.test(f));
const hits = [];
for (const f of files) {
  let text;
  try {
    text = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  text.split("\n").forEach((line, i) => {
    for (const [name, re] of PATTERNS) if (re.test(line)) hits.push(`${f}:${i + 1}  ${name}`);
  });
}
if (hits.length) {
  console.error(`✗ ${hits.length} possible secret(s) in tracked files:\n${hits.join("\n")}`);
  process.exit(1);
}
console.log(`✓ no secrets in ${files.length} tracked files`);
