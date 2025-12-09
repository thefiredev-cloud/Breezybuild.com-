import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  published_at: string | null;
}

interface ArchiveGateViewProps {
  post: Post;
}

export function ArchiveGateView({ post }: ArchiveGateViewProps) {
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Draft';

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Post Preview */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Badge variant="outline">{post.category}</Badge>
          <span className="text-sm text-sand-500">{publishedDate}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-sand-900 mb-4">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-sand-600">{post.excerpt}</p>
        )}
      </div>

      {/* Gate */}
      <div className="bg-gradient-to-br from-breezy-50 to-warm-50 rounded-2xl p-8 border-2 border-breezy-200">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-breezy-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-breezy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-sand-900 mb-2">
          Unlock the Full Archive
        </h2>
        <p className="text-sand-600 mb-6">
          This post is from our archive. Upgrade to any paid plan to access all past posts and insights.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/#pricing">
            <Button variant="primary">
              View Plans
            </Button>
          </Link>
          <Link href="/posts">
            <Button variant="secondary">
              Read Today's Post
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
