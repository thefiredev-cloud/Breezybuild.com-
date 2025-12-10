'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { BoltIcon } from '@heroicons/react/24/solid';

const plans = [
  {
    name: 'Starter',
    tier: 'starter',
    price: '$4.99',
    period: '/month',
    description: 'Perfect for getting started with AI dev tools',
    features: [
      'Full Tool of the Day archive access',
      'Detailed tool analysis & scores',
      'Business fit metrics',
      'Daily email digest',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    tier: 'pro',
    price: '$14.99',
    period: '/month',
    description: 'For serious founders building with AI',
    features: [
      'Everything in Starter',
      'All topic categories',
      'Advanced analytics dashboard',
      'Priority tool requests',
      'Exclusive founder community',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    tier: 'enterprise',
    price: '$99',
    period: '/month',
    description: 'For teams and agencies',
    features: [
      'Everything in Pro',
      'Team access (up to 10 seats)',
      'Custom tool research requests',
      'API access',
      'Dedicated support',
      'White-label reports',
    ],
    highlighted: false,
  },
];

export default function PricingPage() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleCheckout = async (tier: string) => {
    setLoadingTier(tier);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        setLoadingTier(null);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sand-200">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-breezy-500 rounded-lg flex items-center justify-center">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-breezy-600">Breezy</span>
                <span className="text-sand-800">Build</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sand-600 hover:text-sand-900 text-sm font-medium">
                Login
              </Link>
              <Link
                href="/login?signup=true"
                className="px-4 py-2 bg-breezy-500 text-white text-sm font-semibold rounded-lg hover:bg-breezy-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container-wide py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-sand-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-sand-600 max-w-2xl mx-auto">
            Unlock the full archive of AI dev tool research. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-breezy-500 to-warm-500 text-white shadow-xl scale-105'
                  : 'bg-white border border-sand-200 shadow-sm'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-sand-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-sand-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-sand-600'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-sand-900'}`}>
                  {plan.price}
                </span>
                <span className={plan.highlighted ? 'text-white/80' : 'text-sand-600'}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckIcon className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-breezy-500'}`} />
                    <span className={`text-sm ${plan.highlighted ? 'text-white/90' : 'text-sand-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.tier)}
                disabled={loadingTier !== null}
                className={`block w-full py-3 px-4 text-center font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  plan.highlighted
                    ? 'bg-white text-breezy-600 hover:bg-sand-50'
                    : 'bg-breezy-500 text-white hover:bg-breezy-600'
                }`}
              >
                {loadingTier === plan.tier ? 'Loading...' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-sand-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-sand-200">
              <h3 className="font-semibold text-sand-900 mb-2">What do I get with a subscription?</h3>
              <p className="text-sand-600 text-sm">
                Access to our full archive of AI dev tool research, including detailed analysis, scores, business fit metrics, and daily updates on the best tools for non-technical founders.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-sand-200">
              <h3 className="font-semibold text-sand-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-sand-600 text-sm">
                Yes! You can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-sand-200">
              <h3 className="font-semibold text-sand-900 mb-2">Is today&apos;s Tool of the Day free?</h3>
              <p className="text-sand-600 text-sm">
                Yes! The current day&apos;s Tool of the Day is always free for everyone. A subscription unlocks access to the full archive of past research.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-sand-900 text-white py-12 mt-16">
        <div className="container-wide text-center">
          <p className="text-sand-400 text-sm">
            &copy; {new Date().getFullYear()} BreezyBuild. Build with AI, ship with confidence.
          </p>
        </div>
      </footer>
    </div>
  );
}
