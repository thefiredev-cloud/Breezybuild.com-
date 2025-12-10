'use client';

import { ToolContent } from '@/lib/supabase';
import { formatNewsletterDate, truncateContent } from '@/lib/content';
import Link from 'next/link';

interface ArchiveCardProps {
  tool: ToolContent;
  isLocked: boolean;
  isFreeToday?: boolean;
}

const categoryColors: Record<string, string> = {
  ai_coding: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  ai_design: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  devops: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  productivity: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  database: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  hardware_robotics: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  ai_general: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const categoryLabels: Record<string, string> = {
  ai_coding: 'AI Coding',
  ai_design: 'AI Design',
  devops: 'DevOps',
  productivity: 'Productivity',
  database: 'Database',
  hardware_robotics: 'Hardware',
  ai_general: 'AI General',
};

export default function ArchiveCard({ tool, isLocked, isFreeToday }: ArchiveCardProps) {
  const categoryColor = tool.category ? categoryColors[tool.category] : categoryColors.ai_general;
  const categoryLabel = tool.category ? categoryLabels[tool.category] : 'General';

  return (
    <article className="group relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden card-hover transition-all">
      {/* Lock overlay for non-free content */}
      {isLocked && (
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-transparent dark:from-stone-900/95 dark:via-stone-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-stone-900 dark:text-white mb-1">
              Subscriber Only
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Unlock with Pro or Starter
            </p>
          </div>
        </div>
      )}

      <Link href={`/tools/${tool.id}`} className="block">
        <div className="p-5">
          {/* Header with badges */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category badge */}
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${categoryColor}`}>
                {categoryLabel}
              </span>

              {/* Free Today badge */}
              {isFreeToday && (
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Free Today
                </span>
              )}
            </div>

            {/* Date */}
            <time className="text-xs text-stone-400 dark:text-stone-500 shrink-0">
              {new Date(tool.research_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </time>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
            {tool.title}
          </h3>

          {/* Tagline */}
          {tool.tagline && (
            <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mb-4">
              {truncateContent(tool.tagline, 120)}
            </p>
          )}

          {/* Score badges */}
          {(tool.score_learning_curve || tool.score_ecosystem || tool.score_maturity || tool.score_cost_value) && (
            <div className="flex items-center gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              {tool.score_learning_curve && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-500 dark:text-stone-400">Learning</span>
                  <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                    {tool.score_learning_curve}/5
                  </span>
                </div>
              )}
              {tool.score_ecosystem && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-500 dark:text-stone-400">Ecosystem</span>
                  <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                    {tool.score_ecosystem}/5
                  </span>
                </div>
              )}
              {tool.score_maturity && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-500 dark:text-stone-400">Maturity</span>
                  <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                    {tool.score_maturity}/5
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
