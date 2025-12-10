import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import type { SubscriptionTier } from '@/types/database.types';

export const dynamic = 'force-dynamic';

type ProfileRow = { full_name: string | null; avatar_url: string | null };
type SubscriptionRow = { tier: string; status: string };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile and subscription in parallel
  const [profileResult, subscriptionResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single(),
  ]) as [{ data: ProfileRow | null }, { data: SubscriptionRow | null }];

  const profile = profileResult.data;
  const subscription = subscriptionResult.data;

  const tier: SubscriptionTier = (subscription?.tier as SubscriptionTier) || 'free';
  const hasPaidAccess = tier !== 'free';

  const userData = {
    email: user.email || '',
    fullName: profile?.full_name || null,
    avatarUrl: profile?.avatar_url || null,
  };

  const subscriptionData = {
    tier,
    hasPaidAccess,
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <DashboardHeader user={userData} subscription={subscriptionData} />
      {children}
    </div>
  );
}
