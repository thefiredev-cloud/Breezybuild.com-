// Stripe webhook handler for subscription sync
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// Lazy-initialize clients to avoid build-time errors
let _stripe: Stripe | null = null;
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _supabaseAdmin;
}

// Map Stripe price IDs to tiers
function getTierFromPriceId(priceId: string): 'free' | 'starter' | 'pro' | 'enterprise' {
  const starterPrice = process.env.STRIPE_PRICE_STARTER;
  const proPrice = process.env.STRIPE_PRICE_PRO;
  const enterprisePrice = process.env.STRIPE_PRICE_ENTERPRISE;

  if (priceId === starterPrice) return 'starter';
  if (priceId === proPrice) return 'pro';
  if (priceId === enterprisePrice) return 'enterprise';
  return 'free'; // Default to free for unknown price IDs
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!signature) {
    logger.error('No Stripe signature found', { route: '/api/stripe' });
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: String(err), route: '/api/stripe' });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  logger.info(`Processing Stripe event: ${event.type}`, { eventType: event.type, eventId: event.id });

  // Idempotency check - skip if already processed
  const { data: existingEvent } = await getSupabaseAdmin()
    .from('webhook_events')
    .select('id')
    .eq('event_id', event.id)
    .single();

  if (existingEvent) {
    logger.info(`Event already processed, skipping`, { eventId: event.id });
    return NextResponse.json({ received: true, skipped: true });
  }

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

    // Record the event as processed for idempotency
    await getSupabaseAdmin()
      .from('webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString(),
      } as never);

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
  const stripeSubscription = await getStripe().subscriptions.retrieve(subscriptionId) as any;
  const priceId = stripeSubscription.items?.data?.[0]?.price?.id || '';
  const tier = getTierFromPriceId(priceId);

  // Find or create user by email
  const { data: profile } = await getSupabaseAdmin()
    .from('profiles')
    .select('user_id')
    .eq('email', customerEmail)
    .single() as { data: { user_id: string } | null };

  let userId = profile?.user_id;

  // If no profile exists, we'll store the subscription anyway
  // and link it when the user signs up with this email
  if (!userId) {
    logger.info('No user found, creating subscription record for later linking', { email: customerEmail });
    userId = `pending_${session.customer as string}`;
  }

  // Get or create subscription tier ID
  const { data: tierConfig } = await getSupabaseAdmin()
    .from('subscription_tiers')
    .select('id')
    .eq('tier', tier)
    .single() as { data: { id: string } | null };

  const tierId = tierConfig?.id || crypto.randomUUID();

  // Upsert subscription
  const { error: subError } = await getSupabaseAdmin()
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
      } as never,
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

  const { error } = await getSupabaseAdmin()
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
    } as never)
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

  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      auto_renew: false,
    } as never)
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
  const { data: sub } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('user_id, id')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single() as { data: { user_id: string; id: string } | null };

  if (!sub) {
    logger.warn('No subscription found for invoice', { invoiceId: invoice.id });
    return;
  }

  // Record payment
  const { error } = await getSupabaseAdmin().from('payments').insert({
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
  } as never);

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
  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({ status: 'past_due' } as never)
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
