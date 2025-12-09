import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  is_published: boolean;
  created_at: string;
};

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false }) as { data: Post[] | null };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-sand-900">Posts</h1>
        <Link href="/admin/posts/new">
          <Button variant="primary">New Post</Button>
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <div className="bg-white rounded-xl border border-sand-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-sand-50 border-b border-sand-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-sand-600">Title</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-sand-600">Category</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-sand-600">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-sand-600">Date</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-sand-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-sand-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-sand-900">{post.title}</span>
                    <span className="block text-sm text-sand-500">/{post.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{post.category}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    {post.is_published ? (
                      <Badge variant="highlight">Published</Badge>
                    ) : (
                      <span className="text-sand-500 text-sm">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-sand-600">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-breezy-600 hover:text-breezy-700 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-sand-200">
          <h2 className="text-xl font-medium text-sand-900 mb-2">No posts yet</h2>
          <p className="text-sand-600 mb-6">Create your first daily post to get started.</p>
          <Link href="/admin/posts/new">
            <Button variant="primary">Create Post</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
