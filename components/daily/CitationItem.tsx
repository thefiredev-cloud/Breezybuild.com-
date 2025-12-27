interface CitationItemProps {
  source: string;
  index: number;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function CitationItem({ source, index }: CitationItemProps) {
  const domain = getDomain(source);
  const isUrl = source.startsWith('http');

  if (!isUrl) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700
                         text-zinc-600 dark:text-zinc-300 text-sm font-medium flex items-center justify-center">
          {index}
        </span>
        <span className="text-zinc-700 dark:text-zinc-300 text-sm">{source}</span>
      </div>
    );
  }

  return (
    <a
      href={source}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900
                 hover:bg-primary-50 dark:hover:bg-zinc-800 transition-colors group"
    >
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100
                       text-primary-dark text-sm font-medium flex items-center justify-center">
        {index}
      </span>
      <div className="flex-1 min-w-0">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 mb-1">
          {domain}
        </span>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate group-hover:text-primary-dark transition-colors">
          {source}
        </p>
      </div>
      <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-primary flex-shrink-0 transition-colors"
           fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
