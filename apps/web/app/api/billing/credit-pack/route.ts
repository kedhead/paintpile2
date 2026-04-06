import { NextResponse } from 'next/server';
import { validatePBAuth } from '../../../../lib/ai-helpers';
import { createCreditPackCheckout } from '../../../../lib/stripe';

export async function POST(request: Request) {
  try {
    const { pbToken, packSize } = await request.json();
    if (!pbToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['small', 'medium', 'large'].includes(packSize)) {
      return NextResponse.json({ error: 'Invalid pack size' }, { status: 400 });
    }

    const { userId, user } = await validatePBAuth(pbToken);

    const session = await createCreditPackCheckout(
      userId,
      user.email as string,
      packSize,
      user.stripe_customer_id as string | undefined
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Credit pack checkout error:', err);
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
