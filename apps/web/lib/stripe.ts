import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');

  stripeInstance = new Stripe(key);
  return stripeInstance;
}

export async function createCheckoutSession(userId: string, email: string, stripeCustomerId?: string) {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) throw new Error('STRIPE_PRO_PRICE_ID not configured');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thepaintpile.com';

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/settings/subscription?status=success`,
    cancel_url: `${baseUrl}/settings/subscription?status=canceled`,
    metadata: { userId },
  };

  if (stripeCustomerId) {
    sessionParams.customer = stripeCustomerId;
  } else {
    sessionParams.customer_email = email;
  }

  return stripe.checkout.sessions.create(sessionParams);
}

export async function createBillingPortalSession(stripeCustomerId: string) {
  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thepaintpile.com';

  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${baseUrl}/settings/subscription`,
  });
}
