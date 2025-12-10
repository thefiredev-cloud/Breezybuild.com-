import Link from 'next/link';

interface ContentBoundaryProps {
  nextSectionTitle?: string;
  pricingUrl?: string;
}

// SVG Icons
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

export default function ContentBoundary({
  nextSectionTitle = "Premium Content",
  pricingUrl = "/pricing"
}: ContentBoundaryProps) {
  return (
    <div className="relative my-16">
      {/* Gradient fade overlay */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-800 bg-gradient-to-b from-white via-orange-50/30 to-orange-100/50 dark:from-stone-900 dark:via-orange-950/20 dark:to-orange-900/30">
        {/* Main content */}
        <div className="relative z-10 text-center py-12 px-6">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white mb-6 shadow-lg shadow-orange-500/30">
            <LockIcon className="w-8 h-8" />
          </div>

          {/* Heading */}
          <h3 className="font-fraunces text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-3">
            Free Preview Ends Here
          </h3>

          {/* Description */}
          <p className="text-stone-600 dark:text-stone-400 max-w-md mx-auto mb-6">
            Unlock the full guide including detailed comparisons, advanced use cases,
            and exclusive insights for premium members.
          </p>

          {/* CTA Button */}
          <Link
            href={pricingUrl}
            className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3"
          >
            <SparklesIcon className="w-5 h-5" />
            Unlock Full Archive
          </Link>

          {/* Additional info */}
          <p className="mt-4 text-sm text-stone-500 dark:text-stone-500">
            Get instant access to 100+ in-depth tool guides
          </p>
        </div>

        {/* Blurred preview of next section */}
        <div className="relative mt-8">
          {/* Blur effect */}
          <div className="absolute inset-0 backdrop-blur-md bg-white/40 dark:bg-stone-900/40 z-10" />

          {/* Preview content (blurred) */}
          <div className="px-6 pb-8 blur-sm select-none pointer-events-none">
            <h4 className="text-xl font-semibold text-stone-900 dark:text-white mb-4">
              {nextSectionTitle}
            </h4>
            <div className="space-y-3">
              <div className="h-4 bg-stone-300 dark:bg-stone-700 rounded w-full" />
              <div className="h-4 bg-stone-300 dark:bg-stone-700 rounded w-5/6" />
              <div className="h-4 bg-stone-300 dark:bg-stone-700 rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full shadow-lg">
        Premium Content Below
      </div>
    </div>
  );
}
