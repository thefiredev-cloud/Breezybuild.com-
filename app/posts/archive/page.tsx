import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { PostCard } from '@/components/posts/PostCard';
import { isPostFromToday } from '@/lib/auth';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  published_at: string | null;
};

type Subscription = {
  tier: string;
  status: string;
};

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single() as { data: Subscription | null };

  const hasPaidAccess = subscription?.tier && subscription.tier !== 'free';

  // Get all published posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false }) as { data: Post[] | null };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-sand-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-cta flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-sand-900">
              Breezy<span className="text-breezy-500">Build</span>
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/posts" className="text-sand-600 hover:text-sand-900">
              Today
            </Link>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sand-600 hover:text-sand-900"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main Content */}
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
    </div>
  );
}
