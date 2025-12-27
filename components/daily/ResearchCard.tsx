import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

interface ResearchCardProps {
  research: {
    id: string;
    title: string;
    summary: string | null;
    research_date: string;
    topic: {
      name: string;
      slug: string;
    };
  };
  locked?: boolean;
}

export function ResearchCard({ research, locked = false }: ResearchCardProps) {
  const formattedDate = new Date(research.research_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      href={locked ? '#' : `/daily/${research.research_date}`}
      className={`block p-6 rounded-xl border-2 transition-all duration-200 ${
        locked
          ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 opacity-75 cursor-not-allowed'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-primary'
      }`}
      onClick={locked ? (e) => e.preventDefault() : undefined}
    >
      <div className="flex items-center gap-3 mb-3">
        <Badge variant="outline">{research.topic?.name ?? 'Uncategorized'}</Badge>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{formattedDate}</span>
        {locked && (
          <span className="ml-auto flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Upgrade to view
          </span>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{research.title}</h3>
      {research.summary && (
        <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">{research.summary}</p>
      )}
    </Link>
  );
}
