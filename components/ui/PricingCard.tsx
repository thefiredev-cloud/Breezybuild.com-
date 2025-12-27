import { Badge } from './Badge';
import { Button } from './Button';
import type { PricingTier } from '@/types/landing.types';

interface PricingCardProps {
  tier: PricingTier;
  onSelect?: () => void;
}

export function PricingCard({ tier, onSelect }: PricingCardProps) {
  const { name, price, period, description, features, highlighted, badge, cta } = tier;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 p-6 h-full transition-all duration-300
        ${highlighted
          ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-primary-lg scale-[1.02]'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-dark-surface hover:border-primary/30 hover:shadow-card-hover'
        }`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="highlight">{badge}</Badge>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className={`text-xl font-bold font-display ${highlighted ? 'text-primary-700 dark:text-primary-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
          {name}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          {price === 0 ? (
            <span className="text-4xl font-bold text-emerald-500">Free</span>
          ) : (
            <>
              <span className="text-lg text-zinc-500">$</span>
              <span className={`text-4xl font-bold ${highlighted ? 'text-primary' : 'text-zinc-900 dark:text-zinc-100'}`}>
                {price}
              </span>
            </>
          )}
          <span className="text-zinc-500 ml-1">{period}</span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <svg
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${highlighted ? 'text-primary' : 'text-emerald-500'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-zinc-700 dark:text-zinc-300 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        variant={highlighted ? 'primary' : 'secondary'}
        className="w-full"
        onClick={onSelect}
      >
        {cta}
      </Button>
    </div>
  );
}
