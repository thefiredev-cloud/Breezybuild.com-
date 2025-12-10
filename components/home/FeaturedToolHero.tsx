import Link from 'next/link';
import { ToolContent, getScores } from '@/types/tool-content';
import ScoreBadges from './ScoreBadges';

interface FeaturedToolHeroProps {
  tool: ToolContent;
  showDateNavigation?: boolean;
}

export default function FeaturedToolHero({ tool, showDateNavigation = false }: FeaturedToolHeroProps) {
  const publishedDate = new Date(tool.research_date);
  const formattedDate = publishedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const scores = getScores(tool);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-stone-50 dark:from-stone-900 dark:via-stone-900/50 dark:to-stone-900 rounded-2xl border border-orange-200 dark:border-orange-900/30 p-8 sm:p-12">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-amber-200/30 dark:from-orange-500/10 dark:to-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

      <div className="relative z-10 max-w-4xl">
        {/* Category badge */}
        {tool.category && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-sm font-medium mb-4 capitalize">
            {tool.category.replace(/_/g, ' ')}
          </div>
        )}

        {/* Tool name with display font */}
        <h1 className="font-fraunces text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-white mb-4 leading-tight">
          {tool.title}
        </h1>

        {/* Tagline */}
        {tool.tagline && (
          <p className="text-xl sm:text-2xl text-stone-700 dark:text-stone-300 mb-6 leading-relaxed">
            {tool.tagline}
          </p>
        )}

        {/* Summary/description */}
        {tool.summary && (
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 max-w-3xl line-clamp-3">
            {tool.summary}
          </p>
        )}

        {/* Score badges */}
        <div className="mb-8">
          <ScoreBadges scores={scores} />
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-4">
          {tool.official_url && (
            <a
              href={tool.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              Try This Tool
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          <Link
            href={`/archive`}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Browse Archive
          </Link>
        </div>

        {/* Date display */}
        {showDateNavigation && (
          <div className="mt-8 pt-6 border-t border-orange-200 dark:border-orange-900/30">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Tool of the Day &bull; {formattedDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
