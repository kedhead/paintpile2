import { NextResponse } from 'next/server';
import { validatePBAuth } from '../../../../lib/ai-helpers';
import { createBillingPortalSession } from '../../../../lib/stripe';

export async function POST(request: Request) {
  try {
    const { pbToken } = await request.json();
    if (!pbToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = await validatePBAuth(pbToken);
    const stripeCustomerId = user.stripe_customer_id as string;

    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 400 });
    }

    const session = await createBillingPortalSession(stripeCustomerId);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Portal error:', err);
    const message = err instanceof Error ? err.message : 'Portal session failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
