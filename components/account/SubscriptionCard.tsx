'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { SubscriptionTier } from '@/types/database.types';

const STRIPE_LINKS = {
  starter: 'https://buy.stripe.com/9B628l4M6gNG8JS0U0eAg00',
  pro: 'https://buy.stripe.com/14AeV77Yi40U4tC6ekeAg01',
  enterprise: 'https://buy.stripe.com/dRm9AN6Uebtm3pyeKQeAg02',
};

const TIER_CONFIG: Record<SubscriptionTier, { label: string; variant: 'default' | 'highlight' | 'outline' }> = {
  free: { label: 'Free', variant: 'outline' },
  starter: { label: 'Starter', variant: 'default' },
  pro: { label: 'Pro', variant: 'highlight' },
  enterprise: { label: 'Enterprise', variant: 'highlight' },
};

interface SubscriptionCardProps {
  subscription: {
    tier: SubscriptionTier;
    status: string;
    billing_cycle: string | null;
    current_period_end: string | null;
    stripe_customer_id: string | null;
  } | null;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const tier: SubscriptionTier = subscription?.tier || 'free';
  const tierConfig = TIER_CONFIG[tier];
  const isActive = subscription?.status === 'active';
  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card hover={false}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-zinc-900 dark:text-zinc-100">Subscription</h2>
          <Badge variant={tierConfig.variant}>{tierConfig.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Current Plan Details */}
        <div className="mb-6">
          {subscription && isActive && tier !== 'free' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-zinc-700 dark:text-zinc-300">Active subscription</span>
              </div>
              {subscription.billing_cycle && (
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Billed {subscription.billing_cycle}
                </p>
              )}
              {periodEnd && (
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Renews: {periodEnd}
                </p>
              )}
            </div>
          ) : (
            <p className="text-zinc-600 dark:text-zinc-400">
              You are on the free plan. Upgrade to unlock the full archive and premium features.
            </p>
          )}
        </div>

        {/* Upgrade CTAs */}
        {tier === 'free' && (
          <div className="space-y-3">
            <a href={STRIPE_LINKS.starter} className="block">
              <Button variant="secondary" className="w-full justify-between">
                <span>Upgrade to Starter</span>
                <span className="text-primary-dark">$4.99/mo</span>
              </Button>
            </a>
            <a href={STRIPE_LINKS.pro} className="block">
              <Button variant="primary" className="w-full justify-between">
                <span>Upgrade to Pro</span>
                <span>$14.99/mo</span>
              </Button>
            </a>
            <a href={STRIPE_LINKS.enterprise} className="block">
              <Button variant="secondary" className="w-full justify-between">
                <span>Upgrade to Enterprise</span>
                <span className="text-primary-dark">$99/mo</span>
              </Button>
            </a>
          </div>
        )}

        {tier === 'starter' && (
          <div className="space-y-3">
            <a href={STRIPE_LINKS.pro} className="block">
              <Button variant="primary" className="w-full justify-between">
                <span>Upgrade to Pro</span>
                <span>$14.99/mo</span>
              </Button>
            </a>
            <a href={STRIPE_LINKS.enterprise} className="block">
              <Button variant="secondary" className="w-full justify-between">
                <span>Upgrade to Enterprise</span>
                <span className="text-primary-dark">$99/mo</span>
              </Button>
            </a>
          </div>
        )}

        {tier === 'pro' && (
          <a href={STRIPE_LINKS.enterprise} className="block">
            <Button variant="primary" className="w-full justify-between">
              <span>Upgrade to Enterprise</span>
              <span>$99/mo</span>
            </Button>
          </a>
        )}

        {/* Manage Subscription (for Stripe customers) */}
        {subscription?.stripe_customer_id && (
          <div className="mt-4 pt-4 border-t border-zinc-200">
            <p className="text-sm text-zinc-500">
              To manage your subscription, cancel, or update payment method, please contact support.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
