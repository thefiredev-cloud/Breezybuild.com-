'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
      <div className="prose prose-lg max-w-none mb-12
        prose-headings:font-bold prose-headings:text-sand-900 prose-headings:tracking-tight
        prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-14 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b-2 prose-h2:border-sand-100
        prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-sand-800
        prose-p:text-sand-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base prose-p:md:text-lg
        prose-a:text-breezy-600 prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-breezy-300 hover:prose-a:border-breezy-500 hover:prose-a:text-breezy-700
        prose-strong:text-sand-900 prose-strong:font-semibold
        prose-ul:my-6 prose-ul:list-none prose-ul:pl-0
        prose-ol:my-6 prose-ol:list-none prose-ol:pl-0
        prose-li:text-sand-700 prose-li:mb-3 prose-li:pl-6 prose-li:relative
        [&_ul>li]:before:content-[''] [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-2.5 [&_ul>li]:before:w-1.5 [&_ul>li]:before:h-1.5 [&_ul>li]:before:bg-breezy-400 [&_ul>li]:before:rounded-full
        [&_ol]:counter-reset-[item] [&_ol>li]:counter-increment-[item] [&_ol>li]:before:content-[counter(item)] [&_ol>li]:before:absolute [&_ol>li]:before:left-0 [&_ol>li]:before:top-0 [&_ol>li]:before:w-5 [&_ol>li]:before:h-5 [&_ol>li]:before:bg-breezy-100 [&_ol>li]:before:rounded-md [&_ol>li]:before:text-xs [&_ol>li]:before:font-bold [&_ol>li]:before:text-breezy-700 [&_ol>li]:before:flex [&_ol>li]:before:items-center [&_ol>li]:before:justify-center
        prose-blockquote:border-l-4 prose-blockquote:border-breezy-400 prose-blockquote:bg-gradient-to-r prose-blockquote:from-sand-50 prose-blockquote:to-transparent prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-8 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-sand-600
        prose-code:bg-sand-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:text-sand-800 prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-sand-900 prose-pre:text-sand-100 prose-pre:rounded-2xl prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:my-8 prose-pre:shadow-xl
        prose-hr:my-8 prose-hr:border-sand-200
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {research.content.replace(/\[\d+\]/g, '')}
        </ReactMarkdown>
      </div>

      {/* Citations Section */}
      {research.sources && research.sources.length > 0 && (
        <CitationList sources={research.sources} />
      )}
    </article>
  );
}
