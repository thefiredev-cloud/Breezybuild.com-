import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { SubscriptionTier } from '@/types/database.types';

interface SubscriptionStatusCardProps {
  tier: SubscriptionTier;
  hasPaidAccess: boolean;
}

const TIER_CONFIG: Record<SubscriptionTier, { label: string; variant: 'default' | 'highlight' | 'outline' }> = {
  free: { label: 'Free Plan', variant: 'outline' },
  starter: { label: 'Starter Plan', variant: 'default' },
  pro: { label: 'Pro Plan', variant: 'highlight' },
  enterprise: { label: 'Enterprise Plan', variant: 'highlight' },
};

export function SubscriptionStatusCard({ tier, hasPaidAccess }: SubscriptionStatusCardProps) {
  const tierConfig = TIER_CONFIG[tier];

  if (hasPaidAccess) {
    return (
      <Card hover={false} className="border-primary-200 bg-primary-50/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {tierConfig.label}
                  </span>
                  <Badge variant={tierConfig.variant} className="text-xs">
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Full archive access unlocked
                </p>
              </div>
            </div>
            <Link href="/account">
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card hover={false} className="border-primary-200 bg-gradient-to-br from-primary-50 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{tierConfig.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Unlock the Full Archive
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
          Upgrade to access all past posts and daily research. Get curated AI tool recommendations and exclusive templates.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/#pricing">
            <Button variant="primary" size="sm">
              View Plans
            </Button>
          </Link>
          <Link href="/account">
            <Button variant="ghost" size="sm">
              Account Settings
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
