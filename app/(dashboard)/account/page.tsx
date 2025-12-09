import { createClient } from '@/utils/supabase/server';
import { ProfileSection } from '@/components/account/ProfileSection';
import { SubscriptionCard } from '@/components/account/SubscriptionCard';
import { DangerZone } from '@/components/account/DangerZone';
import type { SubscriptionTier } from '@/types/database.types';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile and subscription in parallel
  const [profileResult, subscriptionResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, avatar_url, company_name, website, email_verified')
      .eq('user_id', user!.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('tier, status, billing_cycle, current_period_end, stripe_customer_id')
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .single(),
  ]);

  const profile = profileResult.data;
  const subscription = subscriptionResult.data as {
    tier: SubscriptionTier;
    status: string;
    billing_cycle: string | null;
    current_period_end: string | null;
    stripe_customer_id: string | null;
  } | null;

  return (
    <main className="container-tight py-8 px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-sand-900 mb-8">
        Account Settings
      </h1>

      <div className="space-y-6">
        <ProfileSection
          profile={profile}
          userEmail={user!.email || ''}
        />
        <SubscriptionCard subscription={subscription} />
        <DangerZone />
      </div>
    </main>
  );
}
