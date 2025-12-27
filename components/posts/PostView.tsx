'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/Badge';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string;
  tagline?: string | null;
  key_takeaways?: string[] | null;
  practical_tips?: string[] | null;
  common_mistakes?: string[] | null;
  published_at: string | null;
}

interface PostViewProps {
  post: Post;
}

function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function PostView({ post }: PostViewProps) {
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Draft';

  const readTime = calculateReadTime(post.content);

  // Clean content - remove citation references like [1][3] etc
  const cleanContent = post.content.replace(/\[\d+\]/g, '');

  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-12">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge variant="outline" className="text-sm">{post.category}</Badge>
          <span className="text-zinc-400 dark:text-zinc-500">•</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{publishedDate}</span>
          <span className="text-zinc-400 dark:text-zinc-500">•</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{readTime} min read</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 leading-tight tracking-tight">
          {post.title}
        </h1>
        {post.tagline && (
          <p className="text-xl md:text-2xl text-primary-dark font-medium mb-6 leading-relaxed">{post.tagline}</p>
        )}
        {post.excerpt && (
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed border-l-4 border-primary-200 pl-4 italic">{post.excerpt}</p>
        )}
      </header>

      {/* Key Takeaways - TL;DR Section */}
      {post.key_takeaways && post.key_takeaways.length > 0 && (
        <div className="mb-12 p-8 bg-gradient-to-br from-primary-50 via-white dark:via-zinc-900 to-zinc-50 dark:to-zinc-800 rounded-3xl border border-primary-100 dark:border-zinc-700 shadow-sm">
          <h2 className="font-display text-xl font-bold text-primary-800 dark:text-primary-200 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            Key Takeaways
          </h2>
          <ul className="space-y-4">
            {post.key_takeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-4 text-zinc-700 dark:text-zinc-300">
                <span className="w-7 h-7 rounded-xl bg-primary-100 flex-shrink-0 flex items-center justify-center text-sm font-bold text-primary-700 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-base leading-relaxed">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div className="prose prose-lg max-w-none
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
        prose-table:my-8 prose-table:w-full prose-table:rounded-2xl prose-table:overflow-hidden prose-table:shadow-sm prose-table:border prose-table:border-zinc-200 dark:prose-table:border-zinc-800
        prose-thead:bg-gradient-to-r prose-thead:from-zinc-100 dark:prose-thead:from-zinc-800 prose-thead:to-zinc-50 dark:prose-thead:to-zinc-900
        prose-th:px-5 prose-th:py-4 prose-th:text-left prose-th:font-semibold prose-th:text-zinc-900 dark:prose-th:text-zinc-100 prose-th:text-sm prose-th:uppercase prose-th:tracking-wide
        prose-td:px-5 prose-td:py-4 prose-td:text-zinc-700 dark:prose-td:text-zinc-300 prose-td:border-t prose-td:border-zinc-100 dark:prose-td:border-zinc-800
        prose-tr:transition-colors hover:prose-tr:bg-zinc-50/50 dark:hover:prose-tr:bg-zinc-800/50
        [&_table]:border-collapse
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {cleanContent}
        </ReactMarkdown>
      </div>

      {/* Action Sections Container */}
      <div className="mt-16 space-y-6">
        {/* Practical Tips */}
        {post.practical_tips && post.practical_tips.length > 0 && (
          <div className="p-8 bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-3xl border border-green-100 shadow-sm">
            <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/25">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Practical Tips
            </h2>
            <ul className="space-y-4">
              {post.practical_tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-4 text-zinc-700">
                  <span className="text-green-500 mt-1 flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-base leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Mistakes */}
        {post.common_mistakes && post.common_mistakes.length > 0 && (
          <div className="p-8 bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-3xl border border-amber-100 shadow-sm">
            <h2 className="text-xl font-bold text-amber-800 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              Common Mistakes to Avoid
            </h2>
            <ul className="space-y-4">
              {post.common_mistakes.map((mistake, idx) => (
                <li key={idx} className="flex items-start gap-4 text-zinc-700">
                  <span className="text-amber-500 mt-1 flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-base leading-relaxed">{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
