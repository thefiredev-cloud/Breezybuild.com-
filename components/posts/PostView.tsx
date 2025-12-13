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

export function PostView({ post }: PostViewProps) {
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Draft';

  // Clean content - remove citation references like [1][3] etc
  const cleanContent = post.content.replace(/\[\d+\]/g, '');

  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline">{post.category}</Badge>
          <span className="text-sm text-sand-500">{publishedDate}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-sand-900 mb-4">
          {post.title}
        </h1>
        {post.tagline && (
          <p className="text-xl text-breezy-600 font-medium mb-4">{post.tagline}</p>
        )}
        {post.excerpt && (
          <p className="text-lg text-sand-600 leading-relaxed">{post.excerpt}</p>
        )}
      </header>

      {/* Key Takeaways */}
      {post.key_takeaways && post.key_takeaways.length > 0 && (
        <div className="mb-10 p-6 bg-gradient-to-br from-breezy-50 to-sand-50 rounded-2xl border border-breezy-100">
          <h2 className="text-lg font-semibold text-breezy-700 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-breezy-100 flex items-center justify-center text-breezy-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            Key Takeaways
          </h2>
          <ul className="space-y-3">
            {post.key_takeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sand-700">
                <span className="w-5 h-5 rounded-full bg-breezy-200 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-breezy-700 mt-0.5">
                  {idx + 1}
                </span>
                {takeaway}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div className="prose prose-lg max-w-none
        prose-headings:font-bold prose-headings:text-sand-900
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-sand-200
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-sand-700 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-breezy-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-sand-900 prose-strong:font-semibold
        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-sand-700 prose-li:mb-2
        prose-blockquote:border-l-4 prose-blockquote:border-breezy-400 prose-blockquote:bg-sand-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic prose-blockquote:text-sand-600
        prose-code:bg-sand-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-sand-800
        prose-pre:bg-sand-900 prose-pre:text-sand-100 prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto
        prose-table:my-6 prose-table:w-full
        prose-thead:bg-sand-100
        prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:text-sand-900 prose-th:border-b prose-th:border-sand-200
        prose-td:px-4 prose-td:py-3 prose-td:text-sand-700 prose-td:border-b prose-td:border-sand-100
        prose-tr:hover:bg-sand-50
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {cleanContent}
        </ReactMarkdown>
      </div>

      {/* Practical Tips */}
      {post.practical_tips && post.practical_tips.length > 0 && (
        <div className="mt-10 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
          <h2 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Practical Tips
          </h2>
          <ul className="space-y-3">
            {post.practical_tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sand-700">
                <span className="text-green-500 mt-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Common Mistakes */}
      {post.common_mistakes && post.common_mistakes.length > 0 && (
        <div className="mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
          <h2 className="text-lg font-semibold text-amber-700 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            Common Mistakes to Avoid
          </h2>
          <ul className="space-y-3">
            {post.common_mistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sand-700">
                <span className="text-amber-500 mt-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
