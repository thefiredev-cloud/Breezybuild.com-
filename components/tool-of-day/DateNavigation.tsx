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
    <div className="flex items-center justify-center gap-4 text-sand-600">
      {previousDate ? (
        <Link
          href={`/daily/${previousDate}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-sand-100 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Previous</span>
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-1.5 text-sand-300 cursor-not-allowed">
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Previous</span>
        </span>
      )}

      <div className="flex items-center gap-2 px-4 py-1.5 bg-sand-50 rounded-lg border border-sand-200">
        <CalendarIcon className="w-4 h-4 text-breezy-500" />
        <span className="text-sm font-semibold text-sand-800">{formatDate(currentDate)}</span>
      </div>

      {nextDate ? (
        <Link
          href={`/daily/${nextDate}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-sand-100 transition-colors"
        >
          <span className="text-sm font-medium">Next</span>
          <ChevronRightIcon className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-1.5 text-sand-300 cursor-not-allowed">
          <span className="text-sm font-medium">Next</span>
          <ChevronRightIcon className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}
