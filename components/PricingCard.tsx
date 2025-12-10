'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { TierConfig } from '@/lib/stripe';

interface PricingCardProps {
  tier: string;
  config: TierConfig;
  isPro: boolean;
  userEmail?: string;
  userId?: string;
}

export default function PricingCard({ tier, config, isPro, userEmail, userId }: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(userEmail || '');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleCheckout = async () => {
    // If no user logged in and no email, show email input
    if (!userId && !email) {
      setShowEmailInput(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          userEmail: email || userEmail,
          userId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative bg-white dark:bg-stone-900 rounded-2xl border-2 card-hover ${
        isPro
          ? 'border-orange-400 shadow-xl shadow-orange-500/10'
          : 'border-stone-200 dark:border-stone-800'
      }`}
    >
      {/* Popular badge */}
      {isPro && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-4 py-1.5 bg-linear-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-orange-500/30">
            Most Popular
          </span>
        </div>
      )}

      <div className="p-6 sm:p-8">
        {/* Tier name */}
        <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
          {config.name}
        </h3>

        {/* Price */}
        <div className="mb-4">
          <span className="text-4xl font-bold text-stone-900 dark:text-white">
            ${config.price}
          </span>
          {config.price > 0 && (
            <span className="text-stone-500 dark:text-stone-400">/month</span>
          )}
        </div>

        {/* Description */}
        <p className="text-stone-600 dark:text-stone-400 text-sm mb-6">
          {config.description}
        </p>

        {/* CTA Button */}
        {tier === 'free' ? (
          <Link
            href="/archive"
            className="btn-secondary w-full justify-center"
          >
            Browse Free
          </Link>
        ) : showEmailInput ? (
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              onClick={handleCheckout}
              disabled={loading || !email}
              className={`w-full py-3 px-4 font-semibold rounded-xl text-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isPro
                  ? 'btn-primary justify-center'
                  : 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100'
              }`}
            >
              {loading ? 'Loading...' : 'Continue to Checkout'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={loading}
            className={`w-full py-3 px-4 font-semibold rounded-xl text-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isPro
                ? 'btn-primary justify-center'
                : 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100'
            }`}
          >
            {loading ? 'Loading...' : 'Subscribe'}
          </button>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}

        {/* Features */}
        <ul className="mt-8 space-y-4">
          {config.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-start gap-3">
              <svg
                className={`w-5 h-5 shrink-0 ${
                  isPro ? 'text-orange-500' : 'text-emerald-500'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-stone-600 dark:text-stone-400">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
