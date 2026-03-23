import { NextResponse } from 'next/server';
import { validatePBAuth } from '../../../../lib/ai-helpers';
import { createCheckoutSession } from '../../../../lib/stripe';

export async function POST(request: Request) {
  try {
    const { pbToken } = await request.json();
    if (!pbToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pb, userId, user } = await validatePBAuth(pbToken);

    // Check if already pro
    if (user.subscription === 'pro') {
      return NextResponse.json({ error: 'Already subscribed to Pro' }, { status: 400 });
    }

    const session = await createCheckoutSession(
      userId,
      user.email as string,
      user.stripe_customer_id as string | undefined
    );

    // If no customer ID stored yet, we'll save it after checkout via webhook
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
