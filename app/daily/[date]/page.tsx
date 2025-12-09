import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { ResearchView } from '@/components/daily/ResearchView';
import { ResearchGateView } from '@/components/daily/ResearchGateView';
import { isResearchFromToday } from '@/lib/auth';
import type { DailyResearchWithTopic } from '@/types/database.types';

type ResearchRow = {
  id: string;
  topic_id: string;
  research_date: string;
  title: string;
  summary: string | null;
  content: string;
  sources: string[];
  raw_perplexity: Record<string, unknown> | null;
  is_published: boolean;
  created_at: string;
  topic: {
    id: string;
    name: string;
    slug: string;
    search_query: string;
    is_active: boolean;
    priority: number;
    created_at: string;
  };
};

type Subscription = {
  tier: string;
  status: string;
};

interface DatePageProps {
  params: Promise<{ date: string }>;
}

export default async function DatePage({ params }: DatePageProps) {
  const { date } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get research for this date
  const { data: research } = await supabase
    .from('daily_research')
    .select(`
      *,
      topic:research_topics(*)
    `)
    .eq('is_published', true)
    .eq('research_date', date) as { data: ResearchRow[] | null };

  if (!research || research.length === 0) {
    notFound();
  }

  // Check if this is today's research
  const isToday = isResearchFromToday(date);

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
                <Link href="/daily" className="text-sand-600 hover:text-sand-900">
                  Today
                </Link>
                <Link href="/daily/archive" className="text-sand-600 hover:text-sand-900">
                  Archive
                </Link>
              </nav>
            </div>
          </header>

          <main className="container-wide py-12">
            <ResearchGateView research={research[0] as DailyResearchWithTopic} />
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
            <Link href="/daily" className="text-sand-600 hover:text-sand-900">
              Today
            </Link>
            <Link href="/daily/archive" className="text-sand-600 hover:text-sand-900">
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
              Today&apos;s Research
            </span>
          </div>
        )}
        <div className="space-y-12">
          {research.map((item) => (
            <ResearchView key={item.id} research={item as DailyResearchWithTopic} />
          ))}
        </div>
      </main>
    </div>
  );
}
