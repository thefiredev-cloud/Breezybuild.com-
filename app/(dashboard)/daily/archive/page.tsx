import { createClient } from '@/utils/supabase/server';
import { ResearchCard } from '@/components/daily/ResearchCard';
import { isResearchFromToday } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', user!.id)
    .eq('status', 'active')
    .single() as { data: { tier: string; status: string } | null };

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
  );
}
