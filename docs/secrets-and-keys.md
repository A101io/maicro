# Secrets and keys (baseline A4)

Every secret: where it comes from, where it is set, how to prove it landed. When a credential is "definitely set" and something still fails, **list the NAMES the job can see first** (Sitty lost 17 deploy runs to `CLOUDFLARE_API_SECRET` vs `_TOKEN`). `pnpm scan:secrets` fails CI on anything key-shaped in a tracked file.

## Deploying (GitHub → Cloudflare)

Set on **both** GitHub environments of `A101io/vidalo` (Settings → Environments → `preview` and `production` → Environment secrets; an environment does not inherit a repository secret of the same name):

| Name | Comes from | Prove it |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token → Custom. Account resources: A101's account only. Permissions: **Account · Workers Scripts · Edit**, **Account · Queues · Edit**, **Account · Hyperdrive · Edit**, **Account · Account Settings · Read**. Plus **Zone · Workers Routes · Edit** for the zone `vidalo.io` (the production deploy binds `vidalo.io` and `www.vidalo.io` as Custom Domains; without it the deploy fails naming the zone). | The deploy workflow's "Require the Cloudflare credentials" step passes; on a miss it prints the secret names it can see |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → Account ID in the right column (the same account as Sitty and Sonable) | `wrangler deploy` names the account it deployed to |

## On the Workers (`wrangler secret put NAME --name vidalo-web` / `--name vidalo-worker`)

Production refuses to serve without `DATABASE_URL` or a Hyperdrive binding (503, `apps/web/worker.ts`); it never falls back to mock data.

| Name | Comes from | Set in | Prove it |
|---|---|---|---|
| `DATABASE_URL` | Supabase → Project `bbynmqvaxpjdnkaasutd` → Connect → pooler, service role | Web + worker host env | `/api/health` returns `"db":"pg"` |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Supabase → API | Web host env | Sign-in email arrives |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API | Worker env only; never `NEXT_PUBLIC_` | Worker claims a job |
| `OPENAI_API_KEY`, `GEMINI_API_KEY`, `PERPLEXITY_API_KEY`, `SERPAPI_KEY` | Each provider | Worker + web env | A scan with `VIDALO_MOCK=0` has samples from that engine |
| `GOOGLE_PLACES_API_KEY`, `KVK_API_KEY` | Google Cloud, KvK | Web env | `/scan/kies` lists businesses |
| `GOOGLE_OAUTH_CLIENT_ID/SECRET` | Google Cloud OAuth client | Web env | Verification sets `owner_verified_at` |
| `STRIPE_SECRET_KEY` | Vidalo's own Stripe account (not Sitty `acct_1UA8rHEGTq7D30VV`, not Sonable `acct_1TyIM8EQK4LIWEDd`) | Web env; GitHub environment secret for setup | `pnpm stripe:setup` prints the account id; pin it as `VIDALO_STRIPE_ACCOUNT` |
| `STRIPE_WEBHOOK_SECRET` | Printed once by `pnpm stripe:setup --apply` | Web env | A test event reaches `/api/stripe/webhook` with 200 |
| `STRIPE_PRICE_SETUP/MONITOR`, `STRIPE_TAX_RATE_ID` | `pnpm stripe:setup` output | Web env | Checkout opens with €149 + 21% btw |
| `RESEND_API_KEY` | Resend | Worker + web env | A report mail arrives |
| `UNSUBSCRIBE_SECRET` | `openssl rand -hex 32` | Worker + web env | Unsubscribe link works; without it follow-ups are not sent |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID` | Cloudflare | Worker env | A facts host verifies |
| `INDEXNOW_KEY` | Any random string | Worker env | `/indexnow-key.txt` on a facts host |

Nothing above is set anywhere yet except in local `.env` for mock mode.
