import { createClient } from '@/utils/supabase/server';
import {
  ToolOfDayHeader,
  ToolOfDayHero,
  ToolActions,
  ToolContent,
  ToolSidebar,
  ToolPaywallView,
} from '@/components/tool-of-day';
import { FooterSection } from '@/components/landing/FooterSection';
import { isResearchFromToday } from '@/lib/auth';
import type { DailyResearchWithTopic } from '@/types/database.types';

export const dynamic = 'force-dynamic';

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
  opportunity_score: number;
  problem_score: number;
  feasibility_score: number;
  timing_score: number;
  revenue_potential: string;
  execution_difficulty: number;
  go_to_market_score: number;
  tags: string[];
  tool_url: string | null;
  tool_pricing: string | null;
  is_featured: boolean;
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

async function getAdjacentDates(currentDate: string) {
  const supabase = await createClient();

  // Get previous date (most recent before current)
  const { data: prevData } = await supabase
    .from('daily_research')
    .select('research_date')
    .eq('is_published', true)
    .lt('research_date', currentDate)
    .order('research_date', { ascending: false })
    .limit(1)
    .single() as { data: { research_date: string } | null };

  // Get next date (oldest after current, up to today)
  const today = new Date().toISOString().split('T')[0];
  const { data: nextData } = await supabase
    .from('daily_research')
    .select('research_date')
    .eq('is_published', true)
    .gt('research_date', currentDate)
    .lte('research_date', today)
    .order('research_date', { ascending: true })
    .limit(1)
    .single() as { data: { research_date: string } | null };

  return {
    previousDate: prevData?.research_date || null,
    nextDate: nextData?.research_date || null,
  };
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Try to get today's research first, fall back to most recent
  let { data: research } = await supabase
    .from('daily_research')
    .select(`
      *,
      topic:research_topics(*)
    `)
    .eq('is_published', true)
    .eq('research_date', today)
    .limit(1)
    .single() as { data: ResearchRow | null };

  // If no research today, get most recent
  if (!research) {
    const { data: latestResearch } = await supabase
      .from('daily_research')
      .select(`
        *,
        topic:research_topics(*)
      `)
      .eq('is_published', true)
      .order('research_date', { ascending: false })
      .limit(1)
      .single() as { data: ResearchRow | null };

    research = latestResearch;
  }

  // If still no research, show empty state
  if (!research) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <ToolOfDayHeader user={null} subscription={null} />
        <main className="container-wide py-12">
          <ToolOfDayHero
            currentDate={today}
            previousDate={null}
            nextDate={null}
          />
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Coming Soon</h2>
            <p className="text-zinc-600">Our first Tool of the Day will be published shortly.</p>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  const currentDate = research.research_date;
  const isToday = isResearchFromToday(currentDate);

  // Get user subscription if logged in
  let subscription = null;
  let hasPaidAccess = false;

  if (user) {
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single() as { data: { tier: string; status: string } | null };

    subscription = subData;
    hasPaidAccess = subscription?.tier !== 'free' && subscription?.tier !== undefined;
  }

  // Get adjacent dates for navigation
  const { previousDate, nextDate } = await getAdjacentDates(currentDate);

  // Determine if content should be gated
  const shouldShowPaywall = !isToday && !hasPaidAccess;

  const userData = user ? {
    email: user.email || '',
    fullName: null,
  } : null;

  const subscriptionData = subscription ? {
    tier: subscription.tier,
    hasPaidAccess,
  } : null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <ToolOfDayHeader user={userData} subscription={subscriptionData} />

      <main className="container-wide py-8">
        {/* Hero with Date Navigation */}
        <ToolOfDayHero
          currentDate={currentDate}
          previousDate={previousDate}
          nextDate={nextDate}
        />

        {/* Action Bar */}
        <ToolActions
          toolUrl={research.tool_url}
          toolName={research.title}
        />

        {/* Main Content Area */}
        {shouldShowPaywall ? (
          <ToolPaywallView research={research as DailyResearchWithTopic} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2">
              <ToolContent research={research as DailyResearchWithTopic} />
            </div>

            {/* Sidebar - 1 column */}
            <div className="lg:col-span-1">
              <ToolSidebar research={research} />
            </div>
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
