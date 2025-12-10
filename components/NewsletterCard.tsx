'use client';

import { Newsletter } from '@/lib/supabase';
import { getContentForTier, isContentLocked, formatNewsletterDate, markdownToHtml } from '@/lib/content';
import UpgradePrompt from './UpgradePrompt';

interface NewsletterCardProps {
  newsletter: Newsletter;
  userTier: 'free' | 'starter' | 'pro' | 'enterprise';
  expanded?: boolean;
  isLatest?: boolean; // Latest newsletter gets free starter-level access
}

export default function NewsletterCard({ newsletter, userTier, expanded = false, isLatest = false }: NewsletterCardProps) {
  // Latest newsletter gets starter-level access for free users
  const effectiveTier = (isLatest && userTier === 'free') ? 'starter' : userTier;
  const content = getContentForTier(newsletter, effectiveTier);
  const isLocked = isContentLocked(newsletter, effectiveTier);
  
  return (
    <article className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden card-hover">
      {/* Header */}
      <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <time className="text-sm font-medium text-stone-500 dark:text-stone-400">
            {formatNewsletterDate(newsletter.date)}
          </time>
          {isLatest && userTier === 'free' && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              Free today
            </span>
          )}
        </div>
        {userTier !== 'free' && (
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            userTier === 'enterprise' 
              ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' 
              : userTier === 'pro' 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' 
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
          }`}>
            {userTier.charAt(0).toUpperCase() + userTier.slice(1)}
          </span>
        )}
      </div>
      
      <div className="p-6">
        {/* Title */}
        <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-4 leading-tight">
          {newsletter.subject_line}
        </h2>

        {/* Content */}
        {expanded ? (
          <div className="relative">
            {content ? (
              <div 
                className="prose prose-stone dark:prose-invert max-w-none text-stone-600 dark:text-stone-300"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
              />
            ) : (
              <p className="text-stone-500 dark:text-stone-400 italic">
                No content available for this edition.
              </p>
            )}
            
            {/* Locked content overlay */}
            {isLocked && content && (
              <div className="relative mt-6">
                {/* Fade gradient */}
                <div className="absolute -top-24 left-0 right-0 h-24 bg-linear-to-t from-white dark:from-stone-900 to-transparent pointer-events-none" />
                
                <UpgradePrompt 
                  currentTier={userTier}
                  requiredTier={newsletter.pro_content ? 'pro' : 'starter'}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-stone-600 dark:text-stone-400 line-clamp-3">
            {content || 'No preview available.'}
          </p>
        )}

        {/* Footer */}
        {!expanded && (
          <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {isLocked ? '🔒 Preview only' : '✓ Full access'}
            </span>
            <button className="inline-flex items-center text-orange-500 text-sm font-medium hover:text-orange-600">
              Read more
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
