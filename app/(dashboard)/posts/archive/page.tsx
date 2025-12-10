import { createClient } from '@/utils/supabase/server';
import { PostCard } from '@/components/posts/PostCard';
import { isPostFromToday } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  published_at: string | null;
};

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', user!.id)
    .eq('status', 'active')
    .single() as { data: { tier: string; status: string } | null };

  const hasPaidAccess = subscription?.tier && subscription.tier !== 'free';

  // Get all published posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false }) as { data: Post[] | null };

  return (
    <main className="container-wide py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-sand-900 mb-4">
            Post Archive
          </h1>
          <p className="text-lg text-sand-600">
            {hasPaidAccess
              ? 'Browse all past insights and tutorials'
              : 'Upgrade to unlock the full archive'}
          </p>
        </div>

        {posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => {
              const isToday = isPostFromToday(post.published_at);
              const locked = !isToday && !hasPaidAccess;
              return (
                <PostCard key={post.id} post={post} locked={locked} />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sand-600">No posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </main>
  );
}
