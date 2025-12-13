/**
 * Skills API Authentication
 * Admin authentication wrapper for skills API routes
 */

import { createClient } from '@/utils/supabase/server';
import { isAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// =====================================================
// TYPES
// =====================================================

export interface AuthResult {
  authorized: boolean;
  email?: string;
  userId?: string;
  error?: string;
}

export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
  };
}

// =====================================================
// AUTHENTICATION FUNCTIONS
// =====================================================

/**
 * Verify admin access for skills API
 */
export async function verifyAdminAccess(req: NextRequest): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { authorized: false, error: 'Authentication required' };
    }

    if (!isAdmin(user.email)) {
      return { authorized: false, error: 'Admin access required' };
    }

    return {
      authorized: true,
      email: user.email || undefined,
      userId: user.id,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authorized: false, error: 'Authentication failed' };
  }
}

/**
 * Check if user is authenticated (not necessarily admin)
 */
export async function verifyAuthenticated(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { authorized: false, error: 'Authentication required' };
    }

    return {
      authorized: true,
      email: user.email || undefined,
      userId: user.id,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authorized: false, error: 'Authentication failed' };
  }
}

// =====================================================
// HIGHER-ORDER FUNCTIONS (Route Wrappers)
// =====================================================

type ApiHandler<T> = (
  req: NextRequest,
  auth: AuthResult
) => Promise<NextResponse<T>>;

/**
 * Higher-order function to protect API routes with admin auth
 */
export function withAdminAuth<T>(handler: ApiHandler<T>) {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    const auth = await verifyAdminAccess(req);

    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error } as unknown as T,
        { status: auth.error === 'Authentication required' ? 401 : 403 }
      );
    }

    return handler(req, auth);
  };
}

/**
 * Higher-order function to protect API routes with basic auth (any logged in user)
 */
export function withAuth<T>(handler: ApiHandler<T>) {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    const auth = await verifyAuthenticated();

    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error } as unknown as T,
        { status: 401 }
      );
    }

    return handler(req, auth);
  };
}

// =====================================================
// ERROR RESPONSES
// =====================================================

/**
 * Create a standardized error response
 */
export function createErrorResponse<T>(
  message: string,
  status: number = 500
): NextResponse<T> {
  return NextResponse.json(
    { success: false, error: message } as unknown as T,
    { status }
  );
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

// =====================================================
// PARAM EXTRACTION HELPERS
// =====================================================

/**
 * Extract slug from URL params
 */
export function extractSlugParam(req: NextRequest): string | null {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  // URL pattern: /api/skills/[slug]
  const skillsIndex = pathParts.indexOf('skills');
  if (skillsIndex !== -1 && pathParts.length > skillsIndex + 1) {
    const slug = pathParts[skillsIndex + 1];
    // Don't return 'sync' or other special routes as slugs
    if (slug && !['sync', 'parse'].includes(slug)) {
      return slug;
    }
  }
  return null;
}

/**
 * Extract query parameters for skill listing
 */
export function extractSkillFilters(req: NextRequest): {
  location?: 'global' | 'local';
  search?: string;
  tags?: string[];
  activeOnly?: boolean;
} {
  const { searchParams } = new URL(req.url);

  const location = searchParams.get('location');
  const search = searchParams.get('search');
  const tags = searchParams.get('tags');
  const activeOnly = searchParams.get('activeOnly');

  return {
    location: location === 'global' || location === 'local' ? location : undefined,
    search: search || undefined,
    tags: tags ? tags.split(',').filter(Boolean) : undefined,
    activeOnly: activeOnly === 'false' ? false : true,
  };
}
