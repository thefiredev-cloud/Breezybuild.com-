// Stripe webhook handler for subscription sync
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Create admin client for webhook operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Map Stripe price IDs to tiers
function getTierFromPriceId(priceId: string): 'free' | 'pro' | 'enterprise' {
  const starterPrice = process.env.STRIPE_PRICE_STARTER;
  const proPrice = process.env.STRIPE_PRICE_PRO;
  const enterprisePrice = process.env.STRIPE_PRICE_ENTERPRISE;

  if (priceId === starterPrice) return 'pro'; // Starter maps to pro tier
  if (priceId === proPrice) return 'pro';
  if (priceId === enterprisePrice) return 'enterprise';
  return 'pro'; // Default to pro
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    logger.error('No Stripe signature found', { route: '/api/stripe' });
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: String(err), route: '/api/stripe' });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  logger.info(`Processing Stripe event: ${event.type}`, { eventType: event.type });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        logger.info(`Unhandled event type: ${event.type}`, { eventType: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook handler error', { error: String(error), route: '/api/stripe' });
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  logger.info('Processing checkout.session.completed', { sessionId: session.id });

  // Get customer email from session
  const customerEmail = session.customer_details?.email;
  if (!customerEmail) {
    logger.error('No customer email in session', { sessionId: session.id });
    return;
  }

  // Get subscription details from Stripe
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    logger.info('No subscription in session (one-time payment)', { sessionId: session.id });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
  const priceId = stripeSubscription.items?.data?.[0]?.price?.id || '';
  const tier = getTierFromPriceId(priceId);

  // Find or create user by email
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('user_id')
    .eq('email', customerEmail)
    .single();

  let userId = profile?.user_id;

  // If no profile exists, we'll store the subscription anyway
  // and link it when the user signs up with this email
  if (!userId) {
    logger.info('No user found, creating subscription record for later linking', { email: customerEmail });
    userId = `pending_${session.customer as string}`;
  }

  // Get or create subscription tier ID
  const { data: tierConfig } = await supabaseAdmin
    .from('subscription_tiers')
    .select('id')
    .eq('tier', tier)
    .single();

  const tierId = tierConfig?.id || crypto.randomUUID();

  // Upsert subscription
  const { error: subError } = await supabaseAdmin
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        tier_id: tierId,
        tier: tier,
        status: 'active',
        billing_cycle: stripeSubscription.items.data[0]?.price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
        auto_renew: !stripeSubscription.cancel_at_period_end,
      },
      {
        onConflict: 'stripe_subscription_id',
      }
    );

  if (subError) {
    logger.error('Error upserting subscription', { error: subError.message, email: customerEmail });
    throw subError;
  }

  logger.info('Subscription created/updated', { email: customerEmail, tier });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionUpdated(subscription: any) {
  logger.info('Processing customer.subscription.updated', { subscriptionId: subscription.id });

  const status = mapStripeStatus(subscription.status);
  const priceId = subscription.items?.data?.[0]?.price?.id || '';
  const tier = getTierFromPriceId(priceId);

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: status,
      tier: tier,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      auto_renew: !subscription.cancel_at_period_end,
      cancelled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    logger.error('Error updating subscription', { error: error.message, subscriptionId: subscription.id });
    throw error;
  }

  logger.info('Subscription updated', { subscriptionId: subscription.id, status });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionDeleted(subscription: any) {
  logger.info('Processing customer.subscription.deleted', { subscriptionId: subscription.id });

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      auto_renew: false,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    logger.error('Error cancelling subscription', { error: error.message, subscriptionId: subscription.id });
    throw error;
  }

  logger.info('Subscription cancelled', { subscriptionId: subscription.id });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentSucceeded(invoice: any) {
  logger.info('Processing invoice.payment_succeeded', { invoiceId: invoice.id });

  if (!invoice.subscription) return;

  // Get the subscription to find user_id
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, id')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single();

  if (!sub) {
    logger.warn('No subscription found for invoice', { invoiceId: invoice.id });
    return;
  }

  // Record payment
  const { error } = await supabaseAdmin.from('payments').insert({
    subscription_id: sub.id,
    user_id: sub.user_id,
    amount: invoice.amount_paid / 100, // Convert from cents
    currency: invoice.currency.toUpperCase(),
    status: 'completed',
    stripe_payment_intent_id: invoice.payment_intent as string,
    stripe_invoice_id: invoice.id,
    description: invoice.description || 'Subscription payment',
    receipt_url: invoice.hosted_invoice_url,
    paid_at: new Date().toISOString(),
  });

  if (error) {
    logger.error('Error recording payment', { error: error.message, invoiceId: invoice.id });
  }

  logger.info('Payment recorded', { invoiceId: invoice.id });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentFailed(invoice: any) {
  logger.info('Processing invoice.payment_failed', { invoiceId: invoice.id });

  if (!invoice.subscription) return;

  // Update subscription status to past_due
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription as string);

  if (error) {
    logger.error('Error updating subscription to past_due', { error: error.message, invoiceId: invoice.id });
  }

  logger.info('Subscription marked as past_due', { invoiceId: invoice.id });
}

function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due' {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trial';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'cancelled';
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      return 'expired';
    default:
      return 'active';
  }
}
