# Stripe Setup Guide for Paintpile Pro Subscriptions

## 1. Create Stripe Account
- Go to https://dashboard.stripe.com and sign up / log in
- Complete business verification when ready to go live

## 2. Create the Pro Product & Price
1. Go to **Products** → **Add Product**
2. Name: `Paintpile Pro`
3. Description: `Ad-free experience, 2000 AI credits/month, Pro badge`
4. Pricing:
   - Model: **Recurring**
   - Amount: **$5.00 / month**
   - Currency: USD
5. Save the product
6. Copy the **Price ID** (starts with `price_...`) — you'll need this for env vars

## 3. Set Up Webhook
1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://thepaintpile.com/api/billing/webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Save and copy the **Signing Secret** (starts with `whsec_...`)

## 4. Get API Keys
1. Go to **Developers** → **API Keys**
2. Copy:
   - **Publishable key** (starts with `pk_live_...` or `pk_test_...`)
   - **Secret key** (starts with `sk_live_...` or `sk_test_...`)

## 5. Environment Variables
Add these to your VPS environment (`.env` or pm2 ecosystem config):

```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

### Optional: AdSense (for ad fallback)
```bash
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...
NEXT_PUBLIC_ADSENSE_SLOT_ID=1234567890
```

## 6. Testing with Stripe Test Mode
Before going live, use test mode keys (`pk_test_...` / `sk_test_...`):
- Test card: `4242 4242 4242 4242`, any future expiry, any CVC
- Test webhook locally with Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3000/api/billing/webhook
  ```
  This prints a temporary `whsec_...` to use as `STRIPE_WEBHOOK_SECRET`

## 7. Deploy Checklist
- [ ] Stripe product + price created
- [ ] Webhook endpoint added with correct events
- [ ] Env vars set on VPS
- [ ] PocketBase `ads` collection created (see below)
- [ ] PocketBase `users` collection has `stripe_customer_id` field
- [ ] Rebuild and restart: `cd apps/web && npx next build && pm2 restart paintpile-web`
- [ ] Test checkout flow end-to-end
- [ ] Test webhook by subscribing with test card
- [ ] Test cancellation via Stripe portal
- [ ] Verify Pro badge appears after subscription
- [ ] Verify ads disappear for Pro users
- [ ] Verify AI credit limit shows 2000 for Pro users

## How It Works (Code Flow)

### Subscribe Flow
1. User clicks "Upgrade to Pro" on `/settings/subscription`
2. `useSubscription().subscribe()` → `POST /api/billing/checkout`
3. Server creates Stripe Checkout session with user's email + userId in metadata
4. User redirects to Stripe Checkout, enters payment
5. Stripe sends `checkout.session.completed` webhook → server sets `subscription='pro'` and saves `stripe_customer_id`
6. User redirects back to `/settings/subscription?status=success`

### Cancel Flow
1. Pro user clicks "Manage Subscription" → `POST /api/billing/portal`
2. Redirects to Stripe Billing Portal where they can cancel
3. Stripe sends `customer.subscription.deleted` webhook → server sets `subscription='free'`

### Payment Failure
- Stripe sends `invoice.payment_failed` → server sets `subscription='free'`
- User loses Pro features until payment is resolved

## Files Reference
| File | Purpose |
|------|---------|
| `lib/stripe.ts` | Server-side Stripe client + session helpers |
| `app/api/billing/checkout/route.ts` | Creates checkout session |
| `app/api/billing/webhook/route.ts` | Handles Stripe webhooks |
| `app/api/billing/portal/route.ts` | Creates billing portal session |
| `hooks/use-subscription.ts` | Client-side subscription hook |
| `app/(authenticated)/settings/subscription/page.tsx` | Pricing/upgrade page |
| `components/nav-bar.tsx` | Pro badge display |
| `lib/ai-helpers.ts` | Pro quota boost (2000 vs 500) |
