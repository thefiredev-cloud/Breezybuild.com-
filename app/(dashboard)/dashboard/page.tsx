import { createClient } from '@/utils/supabase/server';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { ContentPreviewCard } from '@/components/dashboard/ContentPreviewCard';
import { QuickLinksSection } from '@/components/dashboard/QuickLinksSection';
import { SubscriptionStatusCard } from '@/components/dashboard/SubscriptionStatusCard';
import type { SubscriptionTier } from '@/types/database.types';

export const dynamic = 'force-dynamic';

type ProfileRow = { full_name: string | null };
type SubscriptionRow = { tier: string; status: string };
type PostRow = { id: string; title: string; slug: string; excerpt: string | null; category: string; published_at: string | null };
type ResearchRow = { id: string; title: string; summary: string | null; research_date: string; topic: { name: string } | null };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all data in parallel
  const [profileResult, subscriptionResult, postResult, researchResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user!.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .single(),
    supabase
      .from('posts')
      .select('id, title, slug, excerpt, category, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('daily_research')
      .select('id, title, summary, research_date, topic:research_topics(name)')
      .eq('is_published', true)
      .order('research_date', { ascending: false })
      .limit(3),
  ]) as [
    { data: ProfileRow | null },
    { data: SubscriptionRow | null },
    { data: PostRow | null },
    { data: ResearchRow[] | null }
  ];

  const profile = profileResult.data;
  const subscription = subscriptionResult.data;
  const post = postResult.data;
  const research = researchResult.data;

  const tier: SubscriptionTier = (subscription?.tier as SubscriptionTier) || 'free';
  const hasPaidAccess = tier !== 'free';

  return (
    <main className="container-wide py-8 space-y-6">
      {/* Welcome Card */}
      <WelcomeCard
        userName={profile?.full_name || null}
        userEmail={user!.email || ''}
      />

      {/* Today's Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Post */}
        <div>
          {post ? (
            <ContentPreviewCard
              type="post"
              title={post.title}
              excerpt={post.excerpt}
              category={post.category}
              href={`/posts/${post.slug}`}
              date={post.published_at}
            />
          ) : (
            <div className="bg-white rounded-xl border border-sand-200 p-6 text-center">
              <p className="text-sand-500">No posts yet. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Today's Research */}
        <div className="space-y-4">
          {research && research.length > 0 ? (
            research.slice(0, 2).map((item) => (
              <ContentPreviewCard
                key={item.id}
                type="research"
                title={item.title}
                excerpt={item.summary}
                category={item.topic?.name}
                href={`/daily/${item.research_date}`}
                date={item.research_date}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl border border-sand-200 p-6 text-center">
              <p className="text-sand-500">No research yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <QuickLinksSection />

      {/* Subscription Status */}
      <SubscriptionStatusCard tier={tier} hasPaidAccess={hasPaidAccess} />
    </main>
  );
}
