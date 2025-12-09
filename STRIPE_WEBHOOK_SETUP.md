# Stripe Webhook Handler Setup Guide

## Overview

This guide explains how to set up and test the Stripe webhook handler for your newsletter platform. The webhook handler automatically syncs subscription and payment data between Stripe and your Supabase database.

## File Location

**Webhook Handler**: `/Users/tanner-osterkamp/Breezybuild.com/Breezybuild.com/app/api/stripe/route.ts`

## Features

The webhook handler processes the following Stripe events:

### Subscription Events
- `checkout.session.completed` - Creates subscription and payment records after successful checkout
- `customer.subscription.created` - Records new subscription in database
- `customer.subscription.updated` - Updates subscription status, billing period, and renewal settings
- `customer.subscription.deleted` - Marks subscription as cancelled

### Payment Events
- `invoice.payment_succeeded` - Records successful payment
- `invoice.payment_failed` - Updates subscription to past_due and records failed payment attempt

## Prerequisites

### 1. Install Dependencies

```bash
npm install stripe @supabase/supabase-js
# or
yarn add stripe @supabase/supabase-js
```

### 2. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Important**: Never commit `.env.local` to version control!

## Setup Instructions

### Step 1: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Secret key** (starts with `sk_test_`)
3. Add to `.env.local` as `STRIPE_SECRET_KEY`

### Step 2: Deploy Your Webhook Endpoint

The webhook endpoint will be available at:
```
https://your-domain.com/api/stripe
```

For local testing:
```
http://localhost:3000/api/stripe
```

### Step 3: Set Up Stripe Webhook

#### Option A: Production Setup (Stripe Dashboard)

1. Go to [Stripe Webhooks Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-domain.com/api/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

#### Option B: Local Testing (Stripe CLI)

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/stripe

# Copy the webhook signing secret and add to .env.local
# Example: whsec_1234567890abcdef
```

The CLI will output a webhook signing secret - add this to your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef
```

### Step 4: Test the Webhook

#### Trigger Test Events with Stripe CLI

```bash
# Test checkout completion
stripe trigger checkout.session.completed

# Test subscription creation
stripe trigger customer.subscription.created

# Test subscription update
stripe trigger customer.subscription.updated

# Test subscription deletion
stripe trigger customer.subscription.deleted

# Test successful payment
stripe trigger invoice.payment_succeeded

# Test failed payment
stripe trigger invoice.payment_failed
```

#### Monitor Webhook Logs

Check your application logs for:
```
Processing Stripe webhook event: checkout.session.completed
Subscription created successfully
Payment record created successfully
```

## Database Integration

### Required Metadata

When creating Stripe checkout sessions or subscriptions, include these metadata fields:

```typescript
// Example: Creating a checkout session
const session = await stripe.checkout.sessions.create({
  // ... other parameters
  metadata: {
    user_id: 'uuid-from-supabase-auth',
    tier_id: 'uuid-from-subscription_tiers-table'
  },
  subscription_data: {
    metadata: {
      user_id: 'uuid-from-supabase-auth',
      tier_id: 'uuid-from-subscription_tiers-table'
    }
  }
});
```

### Database Tables Updated

The webhook handler updates these Supabase tables:

**subscriptions**
- Created/updated on subscription events
- Fields: status, current_period_start, current_period_end, stripe_subscription_id, etc.

**payments**
- Created on payment events
- Fields: amount, currency, status, stripe_payment_intent_id, stripe_invoice_id, etc.

## Security

### Webhook Signature Verification

The handler verifies every webhook request using:

```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
);
```

This ensures that requests actually come from Stripe and haven't been tampered with.

### Best Practices

1. **Never disable signature verification** in production
2. **Use HTTPS** for your webhook endpoint in production
3. **Keep webhook secret secure** - never commit to version control
4. **Use service role key** for Supabase operations (bypasses RLS)
5. **Implement idempotency** - webhook handler is designed to be idempotent
6. **Monitor webhook failures** in Stripe Dashboard

## Error Handling

The webhook handler includes comprehensive error handling:

### Signature Verification Failures
```json
{
  "error": "Webhook signature verification failed: Invalid signature"
}
```
**Status**: 400

### Processing Errors
```json
{
  "error": "Webhook handler failed",
  "details": "Error message here"
}
```
**Status**: 500

### Missing Metadata
Logged but doesn't fail the webhook:
```
Missing user_id or tier_id in subscription metadata
```

## Monitoring & Debugging

### Check Stripe Dashboard

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click on your webhook endpoint
3. View **Recent deliveries** tab
4. Check response codes and retry attempts

### Application Logs

The handler logs detailed information:

```typescript
// Event received
console.log(`Processing Stripe webhook event: ${event.type}`)

// Success
console.log('Subscription created successfully', { userId, subscriptionId })

// Errors
console.error('Failed to create subscription:', error)
```

### Common Issues

#### 1. Webhook Secret Mismatch
**Error**: "Webhook signature verification failed"
**Solution**: Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard/CLI

#### 2. Missing Metadata
**Error**: "Missing user_id or tier_id in subscription metadata"
**Solution**: Add metadata when creating checkout sessions/subscriptions

#### 3. Supabase Connection Issues
**Error**: "Failed to create subscription"
**Solution**: Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly

#### 4. Database Constraint Violations
**Error**: Foreign key constraint violation
**Solution**: Ensure user exists in `profiles` table and tier exists in `subscription_tiers`

## Testing Checklist

- [ ] Environment variables configured
- [ ] Stripe CLI installed and authenticated (for local testing)
- [ ] Webhook endpoint deployed/running
- [ ] Webhook secret configured
- [ ] Test checkout.session.completed event
- [ ] Verify subscription created in Supabase
- [ ] Test subscription.updated event
- [ ] Verify subscription status updated
- [ ] Test invoice.payment_succeeded
- [ ] Verify payment record created
- [ ] Test subscription.deleted event
- [ ] Verify subscription marked as cancelled

## Advanced Configuration

### Custom Status Mapping

The handler maps Stripe statuses to database statuses:

```typescript
{
  'active': 'active',
  'canceled': 'cancelled',
  'incomplete': 'past_due',
  'incomplete_expired': 'expired',
  'past_due': 'past_due',
  'trialing': 'trialing',
  'unpaid': 'past_due',
  'paused': 'cancelled',
}
```

Modify `mapStripeStatus()` function to customize this mapping.

### Adding New Event Types

To handle additional Stripe events:

```typescript
// In POST handler switch statement
case 'customer.updated':
  await handleCustomerUpdated(event.data.object as Stripe.Customer);
  break;

// Add handler function
async function handleCustomerUpdated(customer: Stripe.Customer) {
  // Your logic here
}
```

### Webhook Retry Logic

Stripe automatically retries failed webhooks:
- Immediately on failure
- Then exponentially backs off
- Up to 3 days

Return 200 status code to prevent retries:
```typescript
return NextResponse.json({ received: true }, { status: 200 });
```

## Production Deployment

### Vercel/Netlify

1. Add environment variables to your deployment platform
2. Deploy your application
3. Configure Stripe webhook with production URL
4. Test with live mode Stripe keys

### Next.js Configuration

The webhook handler is configured for Node.js runtime:

```typescript
export const runtime = 'nodejs';
export const preferredRegion = 'auto';
```

This ensures the handler has access to Node.js APIs for Stripe SDK.

## Support Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Example Implementation

See `/Users/tanner-osterkamp/Breezybuild.com/Breezybuild.com/examples/stripe-checkout-example.ts` for a complete example of creating a checkout session that works with this webhook handler.

## Troubleshooting

If webhooks aren't working:

1. Check application logs for errors
2. Verify webhook secret is correct
3. Check Stripe Dashboard for delivery attempts
4. Ensure metadata includes user_id and tier_id
5. Verify database tables exist and have correct schema
6. Test with Stripe CLI trigger commands
7. Check Supabase service role key has proper permissions

For additional help, check the Stripe webhook logs in your dashboard.
