'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Post {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string;
  is_published: boolean;
  published_at: string | null;
  generated_by_ai?: boolean;
  generation_status?: string;
  quality_score?: number;
  quality_issues?: string[];
  tagline?: string;
  key_takeaways?: string[];
  practical_tips?: string[];
  common_mistakes?: string[];
}

interface PostFormProps {
  post?: Post;
  mode: 'create' | 'edit';
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function PostForm({ post, mode }: PostFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [category, setCategory] = useState(post?.category || 'general');
  const [isPublished, setIsPublished] = useState(post?.is_published || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (mode === 'create') {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const postData = {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        category,
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
      };

      if (mode === 'create') {
        const { error } = await supabase.from('posts').insert(postData as never);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .update(postData as never)
          .eq('id', post!.id as never);
        if (error) throw error;
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isAIGenerated = post?.generated_by_ai;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* AI Generated Badge */}
      {isAIGenerated && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="font-medium text-purple-800">AI-Generated Post</span>
            {post.quality_score && (
              <span className="ml-auto text-sm text-purple-600">
                Quality Score: {post.quality_score}/10
              </span>
            )}
          </div>
          {post.quality_issues && post.quality_issues.length > 0 && (
            <div className="text-sm text-purple-700">
              <span className="font-medium">Review notes:</span>{' '}
              {post.quality_issues.join(', ')}
            </div>
          )}
          {post.generation_status === 'draft' && (
            <p className="text-sm text-purple-600 mt-2">
              This post was saved as a draft because it didn&apos;t pass quality checks. Review and edit before publishing.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Title
        </label>
        <Input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Post title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Slug
        </label>
        <Input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="post-url-slug"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Excerpt
        </label>
        <Input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief description (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 bg-white focus:border-primary-400 focus:outline-none transition-colors"
        >
          <option value="general">General</option>
          <option value="tutorial">Tutorial</option>
          <option value="tool">Tool Review</option>
          <option value="workflow">Workflow</option>
          <option value="case-study">Case Study</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content here..."
          rows={15}
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 bg-white focus:border-primary-400 focus:outline-none transition-colors resize-y"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="published"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="w-5 h-5 rounded border-zinc-300 text-primary-500 focus:ring-primary-500"
        />
        <label htmlFor="published" className="text-sm font-medium text-zinc-700">
          Publish immediately
        </label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create Post' : 'Update Post'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
