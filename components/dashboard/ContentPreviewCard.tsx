import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ContentPreviewCardProps {
  type: 'post' | 'research';
  title: string;
  excerpt?: string | null;
  category?: string;
  href: string;
  date?: string | null;
  // Post-specific props
  keyTakeaways?: string[] | null;
  readTime?: number;
  tagline?: string | null;
  // Research-specific props
  opportunityScore?: number;
  isFeatured?: boolean;
}

export function ContentPreviewCard({
  type,
  title,
  excerpt,
  category,
  href,
  date,
  keyTakeaways,
  readTime,
  tagline,
  opportunityScore,
  isFeatured,
}: ContentPreviewCardProps) {
  const icon = type === 'post' ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );

  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-warm hover:scale-[1.02]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-breezy-600">
              {icon}
              <span className="text-sm font-medium">
                {type === 'post' ? "Today's Post" : 'Daily Research'}
              </span>
              {isFeatured && (
                <span className="text-xs bg-breezy-100 text-breezy-700 px-2 py-0.5 rounded-full font-medium">
                  Featured
                </span>
              )}
            </div>
            {category && (
              <Badge variant="default" className="text-xs">
                {category}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold text-sand-900 mb-2 line-clamp-2">
            {title}
          </h3>
          {tagline && (
            <p className="text-breezy-600 text-sm font-medium mb-2">
              {tagline}
            </p>
          )}
          {excerpt && (
            <p className="text-sand-600 text-sm line-clamp-3">
              {excerpt}
            </p>
          )}

          {/* Key Takeaways for Posts */}
          {type === 'post' && keyTakeaways && keyTakeaways.length > 0 && (
            <div className="mt-4 pt-3 border-t border-sand-100">
              <p className="text-xs font-semibold text-sand-500 uppercase tracking-wide mb-2">Key Takeaways</p>
              <ul className="space-y-1">
                {keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                  <li key={idx} className="text-sm text-sand-600 flex items-start gap-2">
                    <span className="text-breezy-500 mt-1 flex-shrink-0">•</span>
                    <span className="line-clamp-1">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Opportunity Score for Research */}
          {type === 'research' && opportunityScore !== undefined && opportunityScore > 0 && (
            <div className="mt-4 pt-3 border-t border-sand-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-sand-500 uppercase tracking-wide">Opportunity</span>
                <div className="flex-1 h-2 bg-sand-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-breezy-400 to-breezy-600 rounded-full"
                    style={{ width: `${opportunityScore}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-breezy-600">{opportunityScore}</span>
              </div>
            </div>
          )}

          {/* Footer with date and read time */}
          <div className="flex items-center gap-2 mt-4 text-sand-400 text-xs">
            {readTime && (
              <>
                <span>{readTime} min read</span>
                <span>•</span>
              </>
            )}
            {date && (
              <span>
                {new Date(date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
