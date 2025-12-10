'use client';

import { ToolContent } from '@/lib/supabase';
import ArchiveCard from './ArchiveCard';

interface ArchiveGridProps {
  tools: ToolContent[];
  isLoading?: boolean;
  userTier: 'free' | 'starter' | 'pro' | 'enterprise';
}

export default function ArchiveGrid({ tools, isLoading, userTier }: ArchiveGridProps) {
  // Free users can only access today's content
  const today = new Date().toISOString().split('T')[0];

  const getIsLocked = (tool: ToolContent): boolean => {
    if (userTier === 'pro' || userTier === 'enterprise' || userTier === 'starter') {
      return false; // Paid users get full access
    }

    // Free users: only today's content is unlocked
    const toolDate = new Date(tool.research_date).toISOString().split('T')[0];
    return toolDate !== today;
  };

  const getIsFreeToday = (tool: ToolContent): boolean => {
    const toolDate = new Date(tool.research_date).toISOString().split('T')[0];
    return toolDate === today;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 animate-pulse"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-20 bg-stone-200 dark:bg-stone-800 rounded-full" />
              <div className="h-4 w-16 bg-stone-200 dark:bg-stone-800 rounded" />
            </div>
            <div className="h-6 w-3/4 bg-stone-200 dark:bg-stone-800 rounded mb-2" />
            <div className="h-4 w-full bg-stone-200 dark:bg-stone-800 rounded mb-1" />
            <div className="h-4 w-5/6 bg-stone-200 dark:bg-stone-800 rounded mb-4" />
            <div className="flex gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <div className="h-4 w-16 bg-stone-200 dark:bg-stone-800 rounded" />
              <div className="h-4 w-16 bg-stone-200 dark:bg-stone-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">
          No tools found
        </h3>
        <p className="text-stone-600 dark:text-stone-400">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool, index) => (
        <div
          key={tool.id}
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
        >
          <ArchiveCard
            tool={tool}
            isLocked={getIsLocked(tool)}
            isFreeToday={getIsFreeToday(tool)}
          />
        </div>
      ))}
    </div>
  );
}
