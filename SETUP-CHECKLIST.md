# PaintPile Setup Checklist

Manual steps remaining for full production readiness.

---

## Stripe (Payments & Subscriptions)

- [ ] **Create Stripe account** at https://dashboard.stripe.com
- [ ] **Create a Pro subscription product** with a monthly price of $5
  - Copy the Price ID (e.g., `price_xxx`)
- [ ] **Set environment variables** on VPS (`/opt/paintpile2/.env` or pm2 ecosystem):
  ```
  STRIPE_SECRET_KEY=sk_live_xxx
  STRIPE_PRO_PRICE_ID=price_xxx
  STRIPE_WEBHOOK_SECRET=whsec_xxx
  ```
- [ ] **Create a Stripe webhook** at https://dashboard.stripe.com/webhooks
  - Endpoint URL: `https://thepaintpile.com/api/billing/webhook`
  - Events to listen for:
    - `checkout.session.completed`
    - `customer.subscription.deleted`
    - `customer.subscription.updated`
    - `invoice.payment_failed`
- [ ] **Add `bonus_credits` field** to the `ai_quota` collection in PocketBase
  - Type: Number, default: 0
  - Go to PocketBase admin: https://thepaintpile.com/_/
  - Collections > ai_quota > Fields > Add field

---

## Google Play Store

- [ ] **Create app listing** in Google Play Console
  - App name: `PaintPile - Miniature Painting`
  - Use short/full descriptions from this session (saved in chat history)
- [ ] **Upload assets**:
  - App icon: `apps/mobile/assets/icon.png` (512x512)
  - Feature graphic: `apps/mobile/assets/feature-graphic.png` (1024x500)
  - At least 2 phone screenshots (take from the app on a device/emulator)
- [ ] **Set privacy policy URL**: `https://thepaintpile.com/privacy`
- [ ] **Set account deletion URL**: `https://thepaintpile.com/settings/account`
- [ ] **Complete content rating questionnaire**:
  - User-generated content: Yes
  - Users can interact: Yes
  - Nudity: Artistic/fantasy (mild/infrequent)
  - Violence: Fantasy (miniature wargaming imagery)
- [ ] **Submit production AAB**: `cd apps/mobile && eas submit --platform android --profile production`
- [ ] **Set up internal testing track** first, then promote to production

---

## Apple App Store (Future)

- [ ] **Apple Developer account** ($99/year)
- [ ] **Get Apple Team ID** from Membership page (10-char string)
- [ ] **Update AASA file**: Replace `TEAM_ID` placeholder in `apps/web/public/.well-known/apple-app-site-association`
- [ ] **Build iOS**: `cd apps/mobile && eas build --platform ios --profile production`
- [ ] **Submit via EAS**: `eas submit --platform ios --profile production`

---

## Google AdSense (Feed Ads)

- [ ] **Create AdSense account** at https://adsense.google.com
- [ ] **Get client ID and slot ID** after approval
- [ ] **Set environment variables** on VPS:
  ```
  NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxx
  NEXT_PUBLIC_ADSENSE_SLOT_ID=xxx
  ```
- [ ] **Add AdSense script** to `apps/web/app/layout.tsx` `<head>`:
  ```html
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxx" crossorigin="anonymous"></script>
  ```
- [ ] Alternatively, use the custom ad system (PocketBase `ads` collection) for direct-sold sponsor ads

---

## PocketBase Collections

- [ ] **`bonus_credits` field on `ai_quota`** (Number, default 0) — needed for credit packs
- [ ] **`expo_push_tokens` collection** — should already exist (created via API earlier). Verify it has:
  - `user` (relation to users)
  - `expo_token` (text)
  - `device_name` (text)

---

## Email (support@thepaintpile.com)

- [ ] Set up an email inbox for `support@thepaintpile.com`
  - This is referenced in Privacy Policy and Terms of Service
  - Options: Google Workspace, Zoho Mail (free), or a simple forwarder

---

## Domain & SSL

- [x] Domain: thepaintpile.com (configured)
- [x] SSL: Let's Encrypt via nginx (configured)
- [x] PocketBase: running on port 8090 behind nginx

---

## VPS Local Commits

The VPS at `/opt/paintpile2` has 10 local commits ahead of GitHub (security headers, follow button fixes, etc.). These should eventually be pushed:

```bash
ssh root@65.75.201.180 "cd /opt/paintpile2 && git push origin main"
```

**Warning:** Review these commits first — some may contain VPS-specific config (like COOP headers in next.config.ts) that shouldn't go to the repo.
