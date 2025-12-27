import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  published_at: string | null;
}

interface PostCardProps {
  post: Post;
  locked?: boolean;
}

export function PostCard({ post, locked = false }: PostCardProps) {
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Draft';

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`block p-6 rounded-xl border-2 transition-all duration-200 ${
        locked
          ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 opacity-75 hover:opacity-100'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-primary'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <Badge variant="outline">{post.category}</Badge>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{publishedDate}</span>
        {locked && (
          <span className="ml-auto flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Upgrade to view
          </span>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{post.title}</h3>
      {post.excerpt && (
        <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">{post.excerpt}</p>
      )}
    </Link>
  );
}
