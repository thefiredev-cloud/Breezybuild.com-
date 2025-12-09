import { notFound } from 'next/navigation';
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

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .single() as { data: { tier: string; status: string } | null };

    const hasPaidAccess = subscription?.tier && subscription.tier !== 'free';

    if (!hasPaidAccess) {
      return (
        <main className="container-wide py-12">
          <ArchiveGateView post={post} />
        </main>
      );
    }
  }

  return (
    <main className="container-wide py-12">
      {isToday && (
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-breezy-600 bg-breezy-50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-breezy-500 rounded-full animate-pulse" />
            Today&apos;s Post
          </span>
        </div>
      )}
      <PostView post={post} />
    </main>
  );
}
