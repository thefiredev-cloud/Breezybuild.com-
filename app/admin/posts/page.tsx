'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import {
  PlusIcon,
  SparklesIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  generated_by_ai: boolean | null;
  generation_status: string | null;
  quality_score: number | null;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<{ success: boolean; message: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'ai' | 'manual' | 'draft'>('all');
  const supabase = createClient();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, category, is_published, published_at, created_at, generated_by_ai, generation_status, quality_score')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading posts:', error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }

  async function generatePost() {
    setGenerating(true);
    setGenerateResult(null);

    try {
      const response = await fetch('/api/posts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        setGenerateResult({
          success: true,
          message: `Generated: "${result.title}" (Score: ${result.qualityScore}/10)`,
        });
        loadPosts(); // Refresh list
      } else {
        setGenerateResult({
          success: false,
          message: result.error || 'Failed to generate post',
        });
      }
    } catch (error) {
      setGenerateResult({
        success: false,
        message: 'Network error. Please try again.',
      });
    }

    setGenerating(false);
  }

  async function deletePost(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      alert('Failed to delete post');
    } else {
      setPosts(posts.filter((p) => p.id !== id));
    }
  }

  const filteredPosts = posts.filter((post) => {
    if (filter === 'all') return true;
    if (filter === 'ai') return post.generated_by_ai;
    if (filter === 'manual') return !post.generated_by_ai;
    if (filter === 'draft') return !post.is_published;
    return true;
  });

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.is_published).length,
    ai: posts.filter((p) => p.generated_by_ai).length,
    drafts: posts.filter((p) => !p.is_published).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sand-900">Posts</h1>
          <p className="text-sand-600 mt-1">
            {stats.total} total &middot; {stats.published} published &middot; {stats.ai} AI-generated
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={generatePost}
            isLoading={generating}
            loadingText="Generating..."
            variant="secondary"
            size="sm"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            Generate with AI
          </Button>
          <Link href="/admin/posts/new">
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Generation Result Banner */}
      {generateResult && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            generateResult.success
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {generateResult.success ? (
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{generateResult.message}</span>
          <button
            onClick={() => setGenerateResult(null)}
            className="ml-auto text-sm opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-sand-200 pb-2">
        {[
          { key: 'all', label: 'All', count: stats.total },
          { key: 'ai', label: 'AI Generated', count: stats.ai },
          { key: 'manual', label: 'Manual', count: stats.total - stats.ai },
          { key: 'draft', label: 'Drafts', count: stats.drafts },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.key
                ? 'bg-breezy-100 text-breezy-700'
                : 'text-sand-600 hover:bg-sand-100'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-xl border border-sand-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sand-500">Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sand-500 mb-4">
              {filter === 'all'
                ? 'No posts yet. Create your first post!'
                : `No ${filter} posts found.`}
            </p>
            {filter === 'all' && (
              <div className="flex gap-3 justify-center">
                <Button onClick={generatePost} variant="secondary" size="sm" isLoading={generating}>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Generate with AI
                </Button>
                <Link href="/admin/posts/new">
                  <Button size="sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-sand-50 border-b border-sand-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-sand-600">Title</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-sand-600 hidden md:table-cell">Category</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-sand-600">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-sand-600 hidden lg:table-cell">Source</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-sand-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-sand-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-sand-900 line-clamp-1">{post.title}</p>
                      <p className="text-sm text-sand-500 line-clamp-1">{post.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-sand-100 text-sand-700">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {post.is_published ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        <CheckCircleIcon className="w-3 h-3" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                        <ClockIcon className="w-3 h-3" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    {post.generated_by_ai ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        <SparklesIcon className="w-3 h-3" />
                        AI {post.quality_score && `(${post.quality_score}/10)`}
                      </span>
                    ) : (
                      <span className="text-sm text-sand-500">Manual</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/posts/${post.id}/edit`}>
                        <button
                          className="p-2 text-sand-600 hover:text-breezy-600 hover:bg-breezy-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => deletePost(post.id, post.title)}
                        className="p-2 text-sand-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
