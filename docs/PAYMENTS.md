# Payments (Stripe)

Two plans, both excl. 21% btw:

| Plan | What | Stripe |
|---|---|---|
| Goed zetten | €149 once | Checkout `mode=payment`, invoice created |
| Goed zetten en houden | €149 once + €49/month | Checkout `mode=subscription`, setup as a one-time first line |
| Goed houden (later) | €49/month | `plan=monitor_addon`, from `/app/abonnement`, verified owner only |

Every line carries the 21% NL tax rate (`STRIPE_TAX_RATE_ID`). A live checkout
without it is refused and the visitor sees "Afrekenen lukt nu even niet":
charging €149 flat for a price shown excl. btw would cost 21% on every sale.

## What a payment does to a business

All of it is in `packages/core/src/billing/index.ts`, tested in
`packages/core/test/billing.test.ts`. The webhook route only verifies the
signature and hands the event over.

- Paid checkout → `trial`, Stripe ids stored, setup job queued (it waits for
  proven ownership; the Google callback queues it again once proven).
- SEPA debit (and slow iDEAL): the session completes unpaid; nothing starts
  until `checkout.session.async_payment_succeeded`. A failed debit starts nothing.
- First renewal (`invoice.paid`, `subscription_cycle`) → `active`.
- Stripe gives up collecting (subscription `unpaid`) → `paused`; paid again → `active`.
- Subscription ended → `churned` (facts page redirects, see publisher/serve.ts).
- Each Stripe event id is handled once per business; retries are no-ops.

Dunning itself is Stripe's: set **Settings → Billing → Subscriptions and
emails → Manage failed payments** to retry (Smart Retries), email the
customer, and then **mark the subscription as unpaid** (not cancel), so a
late payer resumes instead of churning.

## Setting it up

1. A Stripe account that is Maicro's (not Sitty's `acct_1UA8rHEGTq7D30VV`,
   not Sonable's `acct_1TyIM8EQK4LIWEDd`; the script refuses both).
2. Test mode first:
   ```bash
   STRIPE_SECRET_KEY=sk_test_... PUBLIC_BASE_URL=https://<site> pnpm stripe:setup
   ```
   The first run prints the key's account and stops. If it is Maicro's, add
   `MAICRO_STRIPE_ACCOUNT=acct_...` and run again to see what is missing;
   add `--apply` to create it. It prints the env lines for the web app:
   `STRIPE_PRICE_SETUP`, `STRIPE_PRICE_MONITOR`, `STRIPE_TAX_RATE_ID`,
   `STRIPE_WEBHOOK_SECRET` (shown once, at creation).
3. Dashboard, by hand: enable iDEAL and SEPA Direct Debit (Payment methods),
   the Customer portal (cancel at period end, invoice history, update
   payment method), invoice branding with A101 B.V.'s KvK and btw-nummer,
   and the failed-payment settings above.
4. Live: the same with the live key and `--apply --live`.

## Checked here, and not

Checked: the billing rules (10 tests, with a control that fails if an
unpaid SEPA checkout starts the service); every page in mock mode.
Not checked: a real Stripe Checkout, webhook delivery and the portal. This
container cannot reach Stripe, and there is no Maicro key yet.
