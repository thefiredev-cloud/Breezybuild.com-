import { createClient } from '@/utils/supabase/server';
import { ResearchView } from '@/components/daily/ResearchView';
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

export default async function DailyPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // Get today's research with topic info
  const { data: research } = await supabase
    .from('daily_research')
    .select(`
      *,
      topic:research_topics(*)
    `)
    .eq('is_published', true)
    .eq('research_date', today)
    .order('created_at', { ascending: false }) as { data: ResearchRow[] | null };

  // Fallback to most recent if no today's research
  const { data: latestResearch } = !research || research.length === 0
    ? await supabase
        .from('daily_research')
        .select(`
          *,
          topic:research_topics(*)
        `)
        .eq('is_published', true)
        .order('research_date', { ascending: false })
        .limit(6) as { data: ResearchRow[] | null }
    : { data: null };

  const displayResearch = research && research.length > 0 ? research : latestResearch;

  return (
    <main className="container-wide py-12">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
          The Daily
        </span>
      </div>

      {displayResearch && displayResearch.length > 0 ? (
        <div className="space-y-12">
          {displayResearch.map((item) => (
            <ResearchView key={item.id} research={item as DailyResearchWithTopic} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">
            No research yet today
          </h2>
          <p className="text-zinc-600">
            Today&apos;s AI dev tool research is being prepared. Check back soon!
          </p>
        </div>
      )}
    </main>
  );
}
