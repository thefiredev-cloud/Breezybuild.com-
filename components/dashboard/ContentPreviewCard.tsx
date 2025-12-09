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
}

export function ContentPreviewCard({ type, title, excerpt, category, href, date }: ContentPreviewCardProps) {
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
      <Card className="h-full transition-all hover:shadow-warm hover:scale-[1.02]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-breezy-600">
              {icon}
              <span className="text-sm font-medium">
                {type === 'post' ? "Today's Post" : 'Daily Research'}
              </span>
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
          {excerpt && (
            <p className="text-sand-600 text-sm line-clamp-3">
              {excerpt}
            </p>
          )}
          {date && (
            <p className="text-sand-400 text-xs mt-3">
              {new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
