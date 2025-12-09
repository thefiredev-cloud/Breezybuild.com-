import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { PostView } from '@/components/posts/PostView';
import { ArchiveGateView } from '@/components/posts/ArchiveGateView';
import { isPostFromToday } from '@/lib/auth';

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string;
  published_at: string | null;
  is_published: boolean;
};

type Subscription = {
  tier: string;
  status: string;
};

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get the post
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single() as { data: Post | null };

  if (!post) {
    notFound();
  }

  // Check if this is today's post
  const isToday = isPostFromToday(post.published_at);

  if (!isToday) {
    // Check subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single() as { data: Subscription | null };

    const hasPaidAccess = subscription?.tier && subscription.tier !== 'free';

    if (!hasPaidAccess) {
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
                <Link href="/posts/archive" className="text-sand-600 hover:text-sand-900">
                  Archive
                </Link>
              </nav>
            </div>
          </header>

          <main className="container-wide py-12">
            <ArchiveGateView post={post} />
          </main>
        </div>
      );
    }
  }

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
            <Link href="/posts/archive" className="text-sand-600 hover:text-sand-900">
              Archive
            </Link>
          </nav>
        </div>
      </header>

      <main className="container-wide py-12">
        {isToday && (
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-breezy-600 bg-breezy-50 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-breezy-500 rounded-full animate-pulse" />
              Today's Post
            </span>
          </div>
        )}
        <PostView post={post} />
      </main>
    </div>
  );
}
