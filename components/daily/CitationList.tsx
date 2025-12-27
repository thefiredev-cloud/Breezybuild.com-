import { CitationItem } from './CitationItem';

interface CitationListProps {
  sources: string[];
}

export function CitationList({ sources }: CitationListProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
      <h2 className="font-display text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Sources ({sources.length})
      </h2>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <CitationItem key={index} source={source} index={index + 1} />
        ))}
      </div>
    </section>
  );
}
