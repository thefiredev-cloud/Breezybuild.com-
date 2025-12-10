import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { PostView } from '@/components/posts/PostView';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const supabase = await createClient();

  // Get today's post (most recent published)
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <main className="container-wide py-12">
      {post ? (
        <>
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-breezy-600 bg-breezy-50 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-breezy-500 rounded-full animate-pulse" />
              Today&apos;s Post
            </span>
          </div>
          <PostView post={post} />
        </>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-sand-900 mb-4">
            No posts yet
          </h2>
          <p className="text-sand-600 mb-8">
            Check back soon for the first daily insight!
          </p>
          <Link href="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      )}
    </main>
  );
}
