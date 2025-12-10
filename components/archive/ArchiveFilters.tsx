'use client';

import { useState } from 'react';
import { ToolCategory } from '@/lib/supabase';

interface ArchiveFiltersProps {
  selectedCategories: ToolCategory[];
  onCategoriesChange: (categories: ToolCategory[]) => void;
  minLearningCurve: number;
  onMinLearningCurveChange: (value: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

const categories: { value: ToolCategory; label: string }[] = [
  { value: 'ai_coding', label: 'AI Coding' },
  { value: 'ai_design', label: 'AI Design' },
  { value: 'devops', label: 'DevOps' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'database', label: 'Database' },
  { value: 'hardware_robotics', label: 'Hardware' },
  { value: 'ai_general', label: 'AI General' },
];

export default function ArchiveFilters({
  selectedCategories,
  onCategoriesChange,
  minLearningCurve,
  onMinLearningCurveChange,
  searchQuery,
  onSearchChange,
  onClearFilters,
}: ArchiveFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (category: ToolCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const hasActiveFilters = selectedCategories.length > 0 || minLearningCurve > 0 || searchQuery.length > 0;

  return (
    <>
      {/* Mobile filter toggle button */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
        >
          <span className="font-medium text-stone-900 dark:text-white">Filters</span>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                Active
              </span>
            )}
            <svg
              className={`w-5 h-5 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Filter panel */}
      <div
        className={`
          lg:block bg-white dark:bg-stone-900 lg:bg-transparent lg:dark:bg-transparent
          border border-stone-200 dark:border-stone-800 lg:border-0
          rounded-xl lg:rounded-none p-6 lg:p-0 space-y-6
          ${isOpen ? 'block' : 'hidden'}
        `}
      >
        {/* Search input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            Search Tools
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category filters */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => toggleCategory(category.value)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${
                    selectedCategories.includes(category.value)
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }
                `}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Learning curve filter */}
        <div>
          <label htmlFor="learning-curve" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            Min Learning Curve Score
          </label>
          <div className="space-y-2">
            <input
              id="learning-curve"
              type="range"
              min="0"
              max="5"
              step="1"
              value={minLearningCurve}
              onChange={(e) => onMinLearningCurveChange(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>Any</span>
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {minLearningCurve === 0 ? 'Any' : `${minLearningCurve}+`}
              </span>
              <span>5</span>
            </div>
          </div>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="w-full px-4 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </>
  );
}
