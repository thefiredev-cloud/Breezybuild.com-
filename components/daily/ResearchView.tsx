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
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{formattedDate}</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          {research.title}
        </h1>
        {research.summary && (
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {research.summary}
          </p>
        )}
      </header>

      {/* Main Content */}
      <div className="prose prose-lg max-w-none mb-12
        prose-headings:font-display prose-headings:font-bold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-headings:tracking-tight
        prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-14 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b-2 prose-h2:border-zinc-100 dark:prose-h2:border-zinc-800
        prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-zinc-800 dark:prose-h3:text-zinc-200
        prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base prose-p:md:text-lg
        prose-a:text-primary-dark prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-primary-300 hover:prose-a:border-primary hover:prose-a:text-primary
        prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-strong:font-semibold
        prose-ul:my-6 prose-ul:list-none prose-ul:pl-0
        prose-ol:my-6 prose-ol:list-none prose-ol:pl-0
        prose-li:text-zinc-700 dark:prose-li:text-zinc-300 prose-li:mb-3 prose-li:pl-6 prose-li:relative
        [&_ul>li]:before:content-[''] [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-2.5 [&_ul>li]:before:w-1.5 [&_ul>li]:before:h-1.5 [&_ul>li]:before:bg-primary [&_ul>li]:before:rounded-full
        [&_ol]:counter-reset-[item] [&_ol>li]:counter-increment-[item] [&_ol>li]:before:content-[counter(item)] [&_ol>li]:before:absolute [&_ol>li]:before:left-0 [&_ol>li]:before:top-0 [&_ol>li]:before:w-5 [&_ol>li]:before:h-5 [&_ol>li]:before:bg-primary-100 [&_ol>li]:before:rounded-md [&_ol>li]:before:text-xs [&_ol>li]:before:font-bold [&_ol>li]:before:text-primary-700 [&_ol>li]:before:flex [&_ol>li]:before:items-center [&_ol>li]:before:justify-center
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gradient-to-r prose-blockquote:from-zinc-50 dark:prose-blockquote:from-zinc-900 prose-blockquote:to-transparent prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-8 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-400
        prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:text-zinc-800 dark:prose-code:text-zinc-200 prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-950 prose-pre:text-zinc-100 prose-pre:rounded-2xl prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:my-8 prose-pre:shadow-xl
        prose-hr:my-8 prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800
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
