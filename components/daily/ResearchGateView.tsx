import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ResearchGateViewProps {
  research: {
    title: string;
    summary: string | null;
    research_date: string;
    topic: {
      name: string;
    };
  };
}

export function ResearchGateView({ research }: ResearchGateViewProps) {
  const formattedDate = new Date(research.research_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Research Preview */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Badge variant="outline">{research.topic.name}</Badge>
          <span className="text-sm text-sand-500">{formattedDate}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-sand-900 mb-4">
          {research.title}
        </h1>
        {research.summary && (
          <p className="text-sand-600 leading-relaxed">
            {research.summary}
          </p>
        )}
      </div>

      {/* Gate */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-breezy-50 to-sand-50 border-2 border-breezy-100">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-breezy-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-breezy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-sand-900 mb-2">
          Unlock the Archive
        </h2>
        <p className="text-sand-600 mb-6">
          This research is from the archive. Upgrade to access all past research and insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/#pricing">
            <Button variant="primary">
              View Plans
            </Button>
          </Link>
          <Link href="/daily">
            <Button variant="secondary">
              See Today&apos;s Research
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
