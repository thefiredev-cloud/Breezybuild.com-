import Link from 'next/link';
import { LockClosedIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { TagList } from './TagList';
import type { DailyResearchWithTopic } from '@/types/database.types';

interface ToolPaywallViewProps {
  research: DailyResearchWithTopic;
}

export function ToolPaywallView({ research }: ToolPaywallViewProps) {
  return (
    <div className="relative">
      {/* Blurred Preview */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        {/* Visible Header */}
        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            {research.title}
          </h1>

          {research.tags && research.tags.length > 0 && (
            <div className="mb-6">
              <TagList tags={research.tags} maxVisible={4} />
            </div>
          )}

          {research.summary && (
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">{research.summary}</p>
          )}
        </div>

        {/* Blurred Content */}
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-white dark:bg-zinc-900 p-6 blur-sm opacity-50">
            <div className="space-y-4">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-4/6" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 dark:via-zinc-900/80 to-white dark:to-zinc-900" />
        </div>
      </div>

      {/* Paywall CTA */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <LockClosedIcon className="w-8 h-8 text-primary-dark" />
        </div>

        <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Unlock the Full Archive
        </h2>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
          Get instant access to all past Tool of the Day research, including this one.
          Start building smarter with AI-powered insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="https://buy.stripe.com/9B628l4M6gNG8JS0U0eAg00"
            className="w-full sm:w-auto px-8 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all shadow-primary flex items-center justify-center gap-2"
          >
            <SparklesIcon className="w-5 h-5" />
            Unlock for $4.99/mo
          </Link>

          <Link
            href="/pricing"
            className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            See All Plans
          </Link>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4">
          Cancel anytime. Today&apos;s tool is always free.
        </p>
      </div>
    </div>
  );
}
