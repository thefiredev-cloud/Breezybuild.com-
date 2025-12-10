import Link from 'next/link';
import { QuickStartStep } from '@/types/tool-content';

interface QuickStartPreviewProps {
  steps: QuickStartStep[];
  toolSlug?: string;
  maxSteps?: number;
}

export default function QuickStartPreview({
  steps,
  toolSlug,
  maxSteps = 3
}: QuickStartPreviewProps) {
  const previewSteps = steps.slice(0, maxSteps);
  const hasMoreSteps = steps.length > maxSteps;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6">
      {/* Preview Steps */}
      <div className="space-y-4">
        {previewSteps.map((step, index) => (
          <div
            key={step.step}
            className="relative pl-10"
          >
            {/* Step number circle */}
            <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-orange-500/20">
              {step.step}
            </div>

            {/* Connecting line */}
            {index < previewSteps.length - 1 && (
              <div className="absolute left-3.5 top-7 w-0.5 h-full bg-gradient-to-b from-orange-300 to-transparent dark:from-orange-700 dark:to-transparent" />
            )}

            {/* Step content */}
            <div className="pb-4">
              <h4 className="font-semibold text-stone-900 dark:text-white mb-1">
                {step.title}
              </h4>
              <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* See all steps link */}
      {hasMoreSteps && (
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
          <Link
            href={toolSlug ? `/tools/${toolSlug}#quick-start` : '/archive'}
            className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors group"
          >
            See all {steps.length} steps
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
