import { Badge } from '@/components/ui/Badge';
import { CitationList } from './CitationList';
import type { DailyResearchWithTopic } from '@/types/database.types';

interface ResearchViewProps {
  research: DailyResearchWithTopic;
}

export function ResearchView({ research }: ResearchViewProps) {
  const formattedDate = new Date(research.research_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="highlight">{research.topic.name}</Badge>
          <span className="text-sm text-sand-500">{formattedDate}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-sand-900 mb-4">
          {research.title}
        </h1>
        {research.summary && (
          <p className="text-lg text-sand-600 leading-relaxed">
            {research.summary}
          </p>
        )}
      </header>

      {/* Main Content */}
      <div className="prose prose-sand prose-lg max-w-none mb-12">
        <div className="text-sand-700 leading-relaxed whitespace-pre-wrap">
          {research.content}
        </div>
      </div>

      {/* Citations Section */}
      {research.sources && research.sources.length > 0 && (
        <CitationList sources={research.sources} />
      )}
    </article>
  );
}
