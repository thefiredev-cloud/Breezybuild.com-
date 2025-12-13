import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { logger } from './logger';

// Admin emails whitelist - can be configured via environment variable
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

interface ProfileData {
  is_admin: boolean | null;
}

export interface AdminUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Check if an email is in the admin whitelist
 */
export function isAdminEmail(email: string): boolean {
  if (ADMIN_EMAILS.length === 0) {
    // If no whitelist configured, check database is_admin field only
    return false;
  }
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Get the current user and verify they have admin access
 * For use in Server Components and Server Actions
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Check if user is admin via email whitelist
  const isWhitelisted = isAdminEmail(user.email || '');

  // Also check the database for is_admin flag
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single() as { data: ProfileData | null };

  const isAdmin = isWhitelisted || profile?.is_admin === true;

  if (!isAdmin) {
    logger.warn('Non-admin user attempted to access admin area', {
      userId: user.id,
      email: user.email,
    });
    return null;
  }

  return {
    id: user.id,
    email: user.email || '',
    isAdmin: true,
  };
}

/**
 * Require admin access - redirects to home if not authorized
 * For use in Server Components
 */
export async function requireAdmin(): Promise<AdminUser> {
  const adminUser = await getAdminUser();

  if (!adminUser) {
    redirect('/');
  }

  return adminUser;
}

/**
 * Check if the current user is authenticated (not necessarily admin)
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}
