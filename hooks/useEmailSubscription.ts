'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SubscriptionState } from '@/types/landing.types';

const STORAGE_KEY = 'breezy_subscribed';

export function useEmailSubscription() {
  const [state, setState] = useState<SubscriptionState>({ status: 'idle' });
  const [isReturningSubscriber, setIsReturningSubscriber] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const subscribed = localStorage.getItem(STORAGE_KEY);
      if (subscribed === 'true') {
        setIsReturningSubscriber(true);
      }
    }
  }, []);

  const subscribe = useCallback(async (email: string) => {
    setState({ status: 'loading' });

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Subscription failed');
      }

      setState({ status: 'success', email });

      // Persist subscription state
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, 'true');
      }

    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return {
    state,
    subscribe,
    reset,
    isReturningSubscriber,
  };
}
