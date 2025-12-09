'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from './useAuth';
import type { SubscriptionTier } from '@/types/database.types';

type SubscriptionData = {
  tier: string;
  status: string;
};

interface SubscriptionState {
  tier: SubscriptionTier;
  hasPaidAccess: boolean;
  loading: boolean;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setTier('free');
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single() as { data: SubscriptionData | null };

      setTier((data?.tier as SubscriptionTier) ?? 'free');
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const hasPaidAccess = tier !== 'free';

  return { tier, hasPaidAccess, loading };
}
