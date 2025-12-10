interface CommunitySignalsProps {
  size?: string | null;
  sentiment?: string | null;
  notableUsers?: string[] | null;
}

// Sentiment badge color mapping
function getSentimentColor(sentiment: string | null | undefined): {
  bg: string;
  text: string;
  icon: string;
} {
  const normalizedSentiment = sentiment?.toLowerCase() || '';

  if (normalizedSentiment.includes('positive') || normalizedSentiment.includes('very positive')) {
    return {
      bg: 'bg-emerald-100 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      icon: '😊',
    };
  }
  if (normalizedSentiment.includes('negative')) {
    return {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      icon: '😟',
    };
  }
  if (normalizedSentiment.includes('mixed') || normalizedSentiment.includes('neutral')) {
    return {
      bg: 'bg-amber-100 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      icon: '🤔',
    };
  }
  return {
    bg: 'bg-stone-100 dark:bg-stone-900/20',
    text: 'text-stone-700 dark:text-stone-400',
    icon: '😐',
  };
}

// SVG Icons
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

export default function CommunitySignals({ size, sentiment, notableUsers }: CommunitySignalsProps) {
  const sentimentStyle = getSentimentColor(sentiment);
  const hasContent = size || sentiment || (notableUsers && notableUsers.length > 0);

  if (!hasContent) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
          <UsersIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold text-stone-900 dark:text-white">
          Community Signals
        </h3>
      </div>

      <div className="space-y-4">
        {/* Community Size */}
        {size && (
          <div className="flex items-start gap-3 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
            <TrendingIcon className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-stone-900 dark:text-white mb-1">
                Community Size
              </h4>
              <p className="text-stone-600 dark:text-stone-400">
                {size}
              </p>
            </div>
          </div>
        )}

        {/* Sentiment Badge */}
        {sentiment && (
          <div className="flex items-start gap-3 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
            <StarIcon className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-stone-900 dark:text-white mb-2">
                Community Sentiment
              </h4>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${sentimentStyle.bg} ${sentimentStyle.text}`}
              >
                <span>{sentimentStyle.icon}</span>
                <span className="capitalize">{sentiment}</span>
              </span>
            </div>
          </div>
        )}

        {/* Notable Users */}
        {notableUsers && notableUsers.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
            <BuildingIcon className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-stone-900 dark:text-white mb-2">
                Notable Users
              </h4>
              <div className="flex flex-wrap gap-2">
                {notableUsers.map((user, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-full text-sm text-stone-700 dark:text-stone-300"
                  >
                    {user}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
