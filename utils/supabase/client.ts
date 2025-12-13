'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time, env vars might not be available - return a dummy client
  if (!supabaseUrl || !supabaseKey) {
    // This should only happen during build time static generation
    // At runtime, the env vars should always be present
    if (typeof window === 'undefined') {
      throw new Error('Supabase credentials not available during SSR');
    }
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
