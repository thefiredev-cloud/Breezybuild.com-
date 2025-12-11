import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { isResearchFromToday } from '@/lib/auth';
import { BoltIcon, LockClosedIcon } from '@heroicons/react/24/solid';

export const dynamic = 'force-dynamic';

type ResearchRow = {
  id: string;
  title: string;
  summary: string | null;
  research_date: string;
  topic: {
    name: string;
    slug: string;
  } | null;
};

export default async function BrowsePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check subscription status if logged in
  let hasPaidAccess = false;
  if (user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single() as { data: { tier: string; status: string } | null };

    hasPaidAccess = subscription?.tier !== undefined && subscription.tier !== 'free';
  }

  // Get all published research
  const { data: research } = await supabase
    .from('daily_research')
    .select(`
      id,
      title,
      summary,
      research_date,
      topic:research_topics(name, slug)
    `)
    .eq('is_published', true)
    .order('research_date', { ascending: false });

  const typedResearch = research as ResearchRow[] | null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sand-200">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-breezy-500 rounded-lg flex items-center justify-center">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-breezy-600">Breezy</span>
                <span className="text-sand-800">Build</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Link href="/dashboard" className="text-sand-600 hover:text-sand-900 text-sm font-medium">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sand-600 hover:text-sand-900 text-sm font-medium">
                    Login
                  </Link>
                  <Link
                    href="/login?signup=true"
                    className="px-4 py-2 bg-breezy-500 text-white text-sm font-semibold rounded-lg hover:bg-breezy-600 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container-wide py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Browse AI Dev Tools
            </h1>
            <p className="text-lg text-sand-600">
              {hasPaidAccess
                ? 'Explore our complete archive of AI dev tool research'
                : 'Today\'s Tool is free. Upgrade to unlock the full archive.'}
            </p>
          </div>

          {/* Upgrade Banner for non-subscribers */}
          {!hasPaidAccess && (
            <div className="mb-8 p-6 bg-gradient-to-r from-breezy-500 to-warm-500 rounded-xl text-white">
              <div className="flex items-center gap-4">
                <LockClosedIcon className="w-8 h-8 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Unlock the Full Archive</h3>
                  <p className="text-white/80 text-sm">
                    Get access to all past Tool of the Day research for just $4.99/month
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="px-6 py-2 bg-white text-breezy-600 font-semibold rounded-lg hover:bg-sand-50 transition-colors flex-shrink-0"
                >
                  Upgrade
                </Link>
              </div>
            </div>
          )}

          {/* Simple inline cards instead of ResearchCard component */}
          {typedResearch && typedResearch.length > 0 ? (
            <div className="space-y-4">
              {typedResearch
                .filter((item) => item.topic)
                .map((item) => {
                  const isToday = isResearchFromToday(item.research_date);
                  const locked = !isToday && !hasPaidAccess;
                  const formattedDate = new Date(item.research_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <Link
                      key={item.id}
                      href={locked ? '#' : `/daily/${item.research_date}`}
                      className={`block p-6 rounded-xl border-2 transition-all duration-200 ${
                        locked
                          ? 'border-sand-200 bg-sand-50 opacity-75 cursor-not-allowed'
                          : 'border-sand-200 bg-white hover:border-breezy-200 hover:shadow-warm'
                      }`}
                      onClick={locked ? (e) => e.preventDefault() : undefined}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-transparent border border-breezy-300 text-breezy-600">
                          {item.topic?.name ?? 'Uncategorized'}
                        </span>
                        <span className="text-sm text-sand-500">{formattedDate}</span>
                        {locked && (
                          <span className="ml-auto flex items-center gap-1 text-sm text-sand-500">
                            <LockClosedIcon className="w-4 h-4" />
                            Upgrade to view
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-sand-900 mb-2">{item.title}</h3>
                      {item.summary && (
                        <p className="text-sand-600 line-clamp-2">{item.summary}</p>
                      )}
                    </Link>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-sand-600">No research yet. Check back soon!</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-sand-900 text-white py-12 mt-16">
        <div className="container-wide text-center">
          <p className="text-sand-400 text-sm">
            &copy; {new Date().getFullYear()} BreezyBuild. Build with AI, ship with confidence.
          </p>
        </div>
      </footer>
    </div>
  );
}
