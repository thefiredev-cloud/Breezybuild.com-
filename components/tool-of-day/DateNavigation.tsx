'use client';

import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface DateNavigationProps {
  currentDate: string;
  previousDate: string | null;
  nextDate: string | null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DateNavigation({ currentDate, previousDate, nextDate }: DateNavigationProps) {
  return (
    <div className="flex items-center justify-center gap-4 text-zinc-600 dark:text-zinc-400">
      {previousDate ? (
        <Link
          href={`/daily/${previousDate}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Previous</span>
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-1.5 text-zinc-300 dark:text-zinc-600 cursor-not-allowed">
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Previous</span>
        </span>
      )}

      <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <CalendarIcon className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{formatDate(currentDate)}</span>
      </div>

      {nextDate ? (
        <Link
          href={`/daily/${nextDate}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <span className="text-sm font-medium">Next</span>
          <ChevronRightIcon className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-1.5 text-zinc-300 dark:text-zinc-600 cursor-not-allowed">
          <span className="text-sm font-medium">Next</span>
          <ChevronRightIcon className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}
