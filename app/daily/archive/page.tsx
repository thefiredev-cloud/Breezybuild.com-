import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { ResearchCard } from '@/components/daily/ResearchCard';
import { isResearchFromToday } from '@/lib/auth';

type ResearchRow = {
  id: string;
  title: string;
  summary: string | null;
  research_date: string;
  topic: {
    name: string;
    slug: string;
  };
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
    .order('research_date', { ascending: false }) as { data: ResearchRow[] | null };

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
            <Link href="/daily" className="text-sand-600 hover:text-sand-900">
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
              Research Archive
            </h1>
            <p className="text-lg text-sand-600">
              {hasPaidAccess
                ? 'Browse all past AI dev tool research'
                : 'Upgrade to unlock the full archive'}
            </p>
          </div>

          {research && research.length > 0 ? (
            <div className="space-y-4">
              {research.map((item) => {
                const isToday = isResearchFromToday(item.research_date);
                const locked = !isToday && !hasPaidAccess;
                return (
                  <ResearchCard key={item.id} research={item} locked={locked} />
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
    </div>
  );
}
