'use client';

import Link from 'next/link';

interface ArchivePaywallProps {
  onDismiss?: () => void;
}

export default function ArchivePaywall({ onDismiss }: ArchivePaywallProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 max-w-2xl w-full p-8 shadow-2xl">
        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
            Unlock the Full Archive
          </h2>
          <p className="text-stone-600 dark:text-stone-400">
            Get unlimited access to all daily AI tool breakdowns, tutorials, and deep-dives
          </p>
        </div>

        {/* Pricing options */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Starter Plan */}
          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-6 border border-stone-200 dark:border-stone-700">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-1">
                Starter
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-stone-900 dark:text-white">$4.99</span>
                <span className="text-stone-500 dark:text-stone-400">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Full archive access
              </li>
              <li className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Daily tutorials
              </li>
              <li className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                15-minute quick starts
              </li>
            </ul>
            <Link
              href="/pricing"
              className="block w-full py-2.5 px-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-lg font-medium text-center hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border-2 border-orange-400 dark:border-orange-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full">
                Most Popular
              </span>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-1">
                Pro
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-stone-900 dark:text-white">$14.99</span>
                <span className="text-stone-500 dark:text-stone-400">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300">
                <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Everything in Starter
              </li>
              <li className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300">
                <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Technical deep-dives
              </li>
              <li className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300">
                <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Advanced use cases
              </li>
              <li className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300">
                <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Pro tips & gotchas
              </li>
            </ul>
            <Link
              href="/pricing"
              className="block w-full py-2.5 px-4 btn-primary text-center"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-stone-500 dark:text-stone-400">
          Cancel anytime. No questions asked.
        </p>
      </div>
    </div>
  );
}
