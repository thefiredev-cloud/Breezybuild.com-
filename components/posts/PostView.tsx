import { Badge } from '@/components/ui/Badge';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string;
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

  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline">{post.category}</Badge>
          <span className="text-sm text-sand-500">{publishedDate}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-sand-900 mb-4">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-sand-600">{post.excerpt}</p>
        )}
      </header>

      {/* Content - plain text with preserved whitespace */}
      <div className="prose prose-sand prose-lg max-w-none">
        <div className="text-sand-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
    </article>
  );
}
