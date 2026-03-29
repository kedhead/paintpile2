import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { getStripe } from '../../../../lib/stripe';

const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

async function getAdminPB(): Promise<PocketBase> {
  const adminEmail = process.env.PB_ADMIN_EMAIL;
  const adminPassword = process.env.PB_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error('PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD environment variables must be configured');
  }
  const pb = new PocketBase(pbUrl);
  await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
  return pb;
}

async function updateUserSubscription(userId: string, subscription: string, stripeCustomerId?: string) {
  const pb = await getAdminPB();
  const updateData: Record<string, unknown> = { subscription };
  if (stripeCustomerId) {
    updateData.stripe_customer_id = stripeCustomerId;
  }
  await pb.collection('users').update(userId, updateData);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId && session.customer) {
          await updateUserSubscription(userId, 'pro', session.customer as string);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        // Find user by stripe_customer_id
        const pb = await getAdminPB();
        try {
          const users = await pb.collection('users').getFullList({
            filter: `stripe_customer_id = "${customerId}"`,
          });
          for (const user of users) {
            await pb.collection('users').update(user.id, { subscription: 'free' });
          }
        } catch (err) {
          console.error('Failed to find user for subscription deletion:', err);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const pb = await getAdminPB();
        try {
          const users = await pb.collection('users').getFullList({
            filter: `stripe_customer_id = "${customerId}"`,
          });
          for (const user of users) {
            const newSub = status === 'active' ? 'pro' : 'free';
            await pb.collection('users').update(user.id, { subscription: newSub });
          }
        } catch (err) {
          console.error('Failed to update subscription status:', err);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;
        const pb = await getAdminPB();
        try {
          const users = await pb.collection('users').getFullList({
            filter: `stripe_customer_id = "${customerId}"`,
          });
          for (const user of users) {
            await pb.collection('users').update(user.id, { subscription: 'free' });
          }
        } catch (err) {
          console.error('Failed to handle payment failure:', err);
        }
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
