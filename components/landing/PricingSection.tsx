'use client';

import { PricingCard } from '@/components/ui/PricingCard';
import { PRICING } from '@/lib/constants';

const PAYMENT_LINKS: Record<string, string> = {
  Starter: 'https://buy.stripe.com/9B628l4M6gNG8JS0U0eAg00',
  Pro: 'https://buy.stripe.com/14AeV77Yi40U4tC6ekeAg01',
  Enterprise: 'https://buy.stripe.com/dRm9AN6Uebtm3pyeKQeAg02',
};

export function PricingSection() {
  const handleSelect = (tierName: string) => {
    if (tierName === 'Free') {
      window.location.href = '/login';
    } else if (PAYMENT_LINKS[tierName]) {
      window.location.href = PAYMENT_LINKS[tierName];
    }
  };

  return (
    <section id="pricing" className="section-padding bg-white">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-zinc-900 mb-3">
            {PRICING.headline}
          </h2>
          <p className="text-lg text-zinc-600">
            {PRICING.subheadline}
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {PRICING.tiers.map((tier, index) => (
            <PricingCard
              key={index}
              tier={tier}
              onSelect={() => handleSelect(tier.name)}
            />
          ))}
        </div>

        {/* Money back guarantee */}
        <div className="text-center mt-10">
          <p className="text-zinc-500 text-sm">
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              30-day money-back guarantee on all paid plans
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
