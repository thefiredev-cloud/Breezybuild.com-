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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-sand-700 mb-2">
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
        <label className="block text-sm font-medium text-sand-700 mb-2">
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
        <label className="block text-sm font-medium text-sand-700 mb-2">
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
        <label className="block text-sm font-medium text-sand-700 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-sand-200 bg-white focus:border-breezy-400 focus:outline-none transition-colors"
        >
          <option value="general">General</option>
          <option value="tutorial">Tutorial</option>
          <option value="tool">Tool Review</option>
          <option value="workflow">Workflow</option>
          <option value="case-study">Case Study</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-sand-700 mb-2">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content here..."
          rows={15}
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-sand-200 bg-white focus:border-breezy-400 focus:outline-none transition-colors resize-y"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="published"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="w-5 h-5 rounded border-sand-300 text-breezy-500 focus:ring-breezy-500"
        />
        <label htmlFor="published" className="text-sm font-medium text-sand-700">
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
