# Stripe Webhook Handler - Quick Reference

## File Structure

```
Breezybuild.com/
├── app/
│   └── api/
│       └── stripe/
│           └── route.ts          # Webhook handler (MAIN FILE)
├── lib/
│   └── supabase.ts              # Supabase client configuration
├── types/
│   └── database.types.ts        # TypeScript type definitions
├── examples/
│   └── stripe-checkout-example.ts
├── .env.local                   # Environment variables (DO NOT COMMIT)
└── .env.example                 # Environment variables template
```

## Quick Setup

### 1. Install Dependencies
```bash
npm install stripe @supabase/supabase-js
```

### 2. Configure Environment Variables
```bash
cp .env.example .env.local
# Then edit .env.local with your actual keys
```

Required variables:
- `STRIPE_SECRET_KEY` - From Stripe Dashboard > API Keys
- `STRIPE_WEBHOOK_SECRET` - From Stripe Dashboard > Webhooks OR Stripe CLI
- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase Dashboard > Settings > API
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

### 3. Start Development Server
```bash
npm run dev
```

### 4. Forward Webhooks (Local Testing)
```bash
# In a separate terminal
stripe listen --forward-to localhost:3000/api/stripe
```

Copy the webhook signing secret (whsec_...) to `.env.local`

## Webhook Endpoint

**URL**: `https://your-domain.com/api/stripe`
**Method**: POST
**Content-Type**: application/json

## Events Handled

| Event | Action | Database Updates |
|-------|--------|------------------|
| `checkout.session.completed` | Create subscription & payment | subscriptions, payments |
| `customer.subscription.created` | Record new subscription | subscriptions |
| `customer.subscription.updated` | Update subscription details | subscriptions |
| `customer.subscription.deleted` | Mark as cancelled | subscriptions |
| `invoice.payment_succeeded` | Record payment | payments |
| `invoice.payment_failed` | Mark subscription past_due | subscriptions, payments |

## Required Metadata

When creating Stripe checkout sessions or subscriptions, always include:

```typescript
{
  metadata: {
    user_id: "uuid-from-supabase-auth",
    tier_id: "uuid-from-subscription_tiers"
  }
}
```

## Database Schema

### subscriptions table
```sql
- id (uuid)
- user_id (uuid) → profiles.user_id
- tier_id (uuid) → subscription_tiers.id
- status (enum: active, cancelled, past_due, trialing)
- stripe_subscription_id (text, unique)
- stripe_customer_id (text)
- current_period_start (timestamptz)
- current_period_end (timestamptz)
- cancelled_at (timestamptz)
- auto_renew (boolean)
```

### payments table
```sql
- id (uuid)
- user_id (uuid) → profiles.user_id
- subscription_id (uuid, nullable) → subscriptions.id
- amount (decimal)
- currency (text)
- status (enum: pending, completed, failed, refunded)
- stripe_payment_intent_id (text)
- stripe_invoice_id (text)
- paid_at (timestamptz)
```

## Testing Commands

```bash
# Test checkout completion
stripe trigger checkout.session.completed

# Test subscription creation
stripe trigger customer.subscription.created

# Test subscription update
stripe trigger customer.subscription.updated

# Test subscription cancellation
stripe trigger customer.subscription.deleted

# Test successful payment
stripe trigger invoice.payment_succeeded

# Test failed payment
stripe trigger invoice.payment_failed
```

## Common Status Mappings

| Stripe Status | Database Status |
|--------------|-----------------|
| active | active |
| trialing | trialing |
| past_due | past_due |
| canceled | cancelled |
| unpaid | past_due |
| incomplete | past_due |

## Error Responses

### 400 - Bad Request
```json
{
  "error": "Webhook signature verification failed"
}
```
**Fix**: Check STRIPE_WEBHOOK_SECRET matches Stripe Dashboard

### 500 - Internal Server Error
```json
{
  "error": "Webhook handler failed",
  "details": "error message"
}
```
**Fix**: Check application logs for detailed error

## Monitoring

### Check Webhook Deliveries
1. Go to Stripe Dashboard > Webhooks
2. Click on your endpoint
3. View "Recent deliveries" tab

### Application Logs
Look for:
```
✓ Processing Stripe webhook event: checkout.session.completed
✓ Subscription created successfully
✓ Payment record created successfully
```

## Security Checklist

- [x] Webhook signature verification enabled
- [x] HTTPS endpoint (production)
- [x] Service role key stored securely
- [x] Webhook secret not committed to git
- [x] Idempotent operations (safe to retry)
- [x] Proper error handling and logging

## Integration Example

```typescript
// Create checkout session with proper metadata
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: customerId,
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: 'https://yourapp.com/success',
  cancel_url: 'https://yourapp.com/cancel',

  // CRITICAL: Required metadata
  metadata: {
    user_id: userId,
    tier_id: tierId,
  },
  subscription_data: {
    metadata: {
      user_id: userId,
      tier_id: tierId,
    },
  },
});
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Signature verification failed | Ensure webhook secret matches Stripe |
| Missing metadata errors | Add user_id and tier_id to checkout session |
| Subscription not created | Check Supabase logs, verify tier exists |
| Payment not recorded | Verify amount_total > 0 in checkout session |
| Database errors | Check foreign key constraints (user, tier exist) |

## Next Steps

1. Set up Stripe products and prices in Stripe Dashboard
2. Create checkout flow in your app
3. Test with Stripe CLI
4. Deploy to production
5. Configure production webhook in Stripe Dashboard
6. Monitor webhook deliveries

## Support Resources

- **Webhook Handler**: `/app/api/stripe/route.ts`
- **Setup Guide**: `STRIPE_WEBHOOK_SETUP.md`
- **Examples**: `/examples/stripe-checkout-example.ts`
- **Stripe Docs**: https://stripe.com/docs/webhooks
- **Supabase Docs**: https://supabase.com/docs
