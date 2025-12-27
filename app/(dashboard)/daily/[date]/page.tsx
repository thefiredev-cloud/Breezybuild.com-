import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ResearchView } from '@/components/daily/ResearchView';
import { ResearchGateView } from '@/components/daily/ResearchGateView';
import { isResearchFromToday } from '@/lib/auth';
import { getContentAccessLevel, type ContentAccessLevel } from '@/lib/content-access';
import type { DailyResearchWithTopic, SubscriptionTier } from '@/types/database.types';

export const dynamic = 'force-dynamic';

type ResearchRow = {
  id: string;
  topic_id: string;
  research_date: string;
  title: string;
  summary: string | null;
  content: string;
  free_preview: string | null;
  starter_content: string | null;
  pro_content: string | null;
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

interface DatePageProps {
  params: Promise<{ date: string }>;
}

export default async function DatePage({ params }: DatePageProps) {
  const { date } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  // Check if this is today's research (free access for everyone)
  const isToday = isResearchFromToday(date);

  // Get user's subscription tier
  let userTier: SubscriptionTier = 'free';
  let accessLevel: ContentAccessLevel = 'preview';

  if (user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single() as { data: { tier: SubscriptionTier; status: string } | null };

    if (subscription) {
      userTier = subscription.tier;
      accessLevel = getContentAccessLevel(userTier);
    }
  }

  // For today's content, everyone gets at least starter-level access
  if (isToday && accessLevel === 'preview') {
    accessLevel = 'starter';
  }

  // Show paywall gate for archive content if user doesn't have access
  if (!isToday && accessLevel === 'preview') {
    return (
      <main className="container-wide py-12">
        <ResearchGateView
          research={research[0] as unknown as DailyResearchWithTopic}
        />
      </main>
    );
  }

  return (
    <main className="container-wide py-12">
      {isToday && (
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-dark bg-primary/10 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Today&apos;s Research
          </span>
        </div>
      )}

      {/* Show upgrade prompt for starter users viewing pro content */}
      {accessLevel === 'starter' && research[0]?.pro_content && (
        <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
          <p className="text-zinc-700 dark:text-zinc-300 text-sm">
            <span className="font-semibold">Deep Dive available!</span>{' '}
            Upgrade to Pro to unlock technical deep-dives and advanced analysis.
          </p>
        </div>
      )}

      <div className="space-y-12">
        {research.map((item) => (
          <ResearchView
            key={item.id}
            research={item as unknown as DailyResearchWithTopic}
          />
        ))}
      </div>
    </main>
  );
}
