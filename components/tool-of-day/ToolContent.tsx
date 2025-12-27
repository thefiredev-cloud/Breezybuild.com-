import { TagList } from './TagList';
import { CitationList } from '@/components/daily/CitationList';
import type { DailyResearchWithTopic } from '@/types/database.types';

interface ToolContentProps {
  research: DailyResearchWithTopic;
}

export function ToolContent({ research }: ToolContentProps) {
  return (
    <article className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
      {/* Tool Title */}
      <h1 className="font-display text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        {research.title}
      </h1>

      {/* Tags */}
      {research.tags && research.tags.length > 0 && (
        <div className="mb-6">
          <TagList tags={research.tags} maxVisible={4} />
        </div>
      )}

      {/* Summary */}
      {research.summary && (
        <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{research.summary}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="prose prose-zinc max-w-none">
        <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {formatContentSafe(research.content)}
        </div>
      </div>

      {/* Citations */}
      {research.sources && research.sources.length > 0 && (
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Sources</h2>
          <CitationList sources={research.sources} />
        </div>
      )}
    </article>
  );
}

function formatContentSafe(content: string): React.ReactNode {
  // Split content into lines and format
  const lines = content.split('\n');

  return lines.map((line, index) => {
    // Headers
    if (line.startsWith('### ')) {
      return <h3 key={index} className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-6 mb-3">{line.slice(4)}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="font-display text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">{line.slice(3)}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={index} className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">{line.slice(2)}</h1>;
    }

    // List items
    if (line.startsWith('- ')) {
      return <li key={index} className="ml-4 list-disc">{formatInlineText(line.slice(2))}</li>;
    }
    if (/^\d+\.\s/.test(line)) {
      return <li key={index} className="ml-4 list-decimal">{formatInlineText(line.replace(/^\d+\.\s/, ''))}</li>;
    }

    // Empty lines
    if (line.trim() === '') {
      return <br key={index} />;
    }

    // Regular paragraphs
    return <p key={index} className="mb-4">{formatInlineText(line)}</p>;
  });
}

function formatInlineText(text: string): React.ReactNode {
  // Simple bold detection
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-zinc-900 dark:text-zinc-100">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
