import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Redis client (lazy initialization)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Rate limiting disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set');
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
}

// Rate limiters for different use cases
const limiters: Record<string, Ratelimit | null> = {};

/**
 * Get or create a rate limiter with specified configuration
 */
function getRateLimiter(
  name: string,
  requests: number,
  window: `${number} s` | `${number} m` | `${number} h` | `${number} d`
): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  if (!limiters[name]) {
    limiters[name] = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: true,
      prefix: `ratelimit:${name}`,
    });
  }

  return limiters[name];
}

/**
 * Pre-configured rate limiters
 */
export const rateLimiters = {
  // General API: 60 requests per minute
  api: () => getRateLimiter('api', 60, '1 m'),

  // Subscribe endpoint: 5 requests per minute (prevent spam)
  subscribe: () => getRateLimiter('subscribe', 5, '1 m'),

  // Checkout: 10 requests per minute
  checkout: () => getRateLimiter('checkout', 10, '1 m'),

  // Auth endpoints: 10 requests per minute
  auth: () => getRateLimiter('auth', 10, '1 m'),

  // Strict: 3 requests per minute (for sensitive operations)
  strict: () => getRateLimiter('strict', 3, '1 m'),
};

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
export function getIdentifier(req: NextRequest): string {
  // Try to get user ID from auth header or session
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    // Use a hash of the auth header as identifier
    return `auth:${hashString(authHeader)}`;
  }

  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `ip:${ip}`;
}

/**
 * Simple string hash for creating identifiers
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Rate limit response with proper headers
 */
export function rateLimitResponse(
  reset: number,
  limit: number,
  remaining: number
): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests',
      message: 'Please slow down and try again later',
      retryAfter: Math.ceil((reset - Date.now()) / 1000),
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    }
  );
}

/**
 * Check rate limit for a request
 * Returns null if allowed, or a NextResponse if rate limited
 */
export async function checkRateLimit(
  req: NextRequest,
  limiterType: keyof typeof rateLimiters = 'api'
): Promise<NextResponse | null> {
  const limiter = rateLimiters[limiterType]();

  // If rate limiting is not configured, allow the request
  if (!limiter) {
    return null;
  }

  const identifier = getIdentifier(req);
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    return rateLimitResponse(reset, limit, remaining);
  }

  return null;
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limiterType: keyof typeof rateLimiters = 'api'
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const rateLimitResult = await checkRateLimit(req, limiterType);
    if (rateLimitResult) {
      return rateLimitResult;
    }
    return handler(req);
  };
}
