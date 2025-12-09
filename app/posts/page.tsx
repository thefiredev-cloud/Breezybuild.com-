import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { PostView } from '@/components/posts/PostView';
import { Button } from '@/components/ui/Button';

export default async function PostsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get today's post (most recent published)
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

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
            <Link href="/posts/archive" className="text-sand-600 hover:text-sand-900">
              Archive
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
        {post ? (
          <>
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-breezy-600 bg-breezy-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-breezy-500 rounded-full animate-pulse" />
                Today's Post
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
            <Link href="/">
              <Button variant="secondary">Back to Home</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
