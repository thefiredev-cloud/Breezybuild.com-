'use client';

import { useState, useEffect } from 'react';
import { ToolContent, ToolCategory } from '@/lib/supabase';
import ArchiveFilters from '@/components/archive/ArchiveFilters';
import ArchiveGrid from '@/components/archive/ArchiveGrid';
import ArchivePaywall from '@/components/archive/ArchivePaywall';
import Link from 'next/link';

interface ArchiveClientProps {
  initialTools: ToolContent[];
  initialTotal: number;
  userTier: 'free' | 'starter' | 'pro' | 'enterprise';
}

export default function ArchiveClient({ initialTools, initialTotal, userTier }: ArchiveClientProps) {
  const [tools, setTools] = useState<ToolContent[]>(initialTools);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<ToolCategory[]>([]);
  const [minLearningCurve, setMinLearningCurve] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  // Fetch tools with filters
  const fetchTools = async (resetPage = false) => {
    setIsLoading(true);
    const currentPage = resetPage ? 1 : page;

    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: limit.toString(),
    });

    if (selectedCategories.length > 0) {
      params.append('category', selectedCategories[0]); // For simplicity, use first category
    }

    if (searchQuery) {
      params.append('search', searchQuery);
    }

    if (minLearningCurve > 0) {
      params.append('minLearningCurve', minLearningCurve.toString());
    }

    try {
      const response = await fetch(`/api/tools/archive?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setTools(data.tools);
        setTotal(data.pagination.total);
        if (resetPage) setPage(1);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTools(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategories, minLearningCurve, searchQuery]);

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setMinLearningCurve(0);
    setSearchQuery('');
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (page > 1) {
      fetchTools(false);
    }
  }, [page]);

  const hasMoreResults = tools.length < total;
  const hasActiveFilters = selectedCategories.length > 0 || minLearningCurve > 0 || searchQuery.length > 0;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-4 tracking-tight">
            Tool Archive
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl">
            {userTier === 'free'
              ? "Browse our collection of AI tools. Today's tool is free to read—subscribe for full archive access."
              : 'Browse all daily AI tool updates with full tutorials and deep-dives.'}
          </p>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Filters sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ArchiveFilters
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              minLearningCurve={minLearningCurve}
              onMinLearningCurveChange={setMinLearningCurve}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Main content */}
          <main>
            {/* Results header */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {isLoading ? 'Loading...' : `${total} tool${total !== 1 ? 's' : ''} found`}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Grid */}
            <ArchiveGrid tools={tools} isLoading={isLoading} userTier={userTier} />

            {/* Load more button */}
            {hasMoreResults && !isLoading && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  className="btn-secondary"
                >
                  Load More Tools
                </button>
              </div>
            )}

            {/* Upgrade prompt for free users */}
            {userTier === 'free' && tools.length > 0 && (
              <div className="mt-16 gradient-border p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-3">
                  Unlock the Full Archive
                </h2>
                <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-md mx-auto">
                  Get unlimited access to all {total} tools with complete tutorials and ship-ready guides.
                </p>
                <Link href="/pricing" className="btn-primary inline-flex items-center">
                  View Plans
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Paywall modal (optional - can be triggered by clicking locked items) */}
      {showPaywall && <ArchivePaywall onDismiss={() => setShowPaywall(false)} />}
    </div>
  );
}
