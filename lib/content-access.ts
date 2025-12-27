import type { SubscriptionTier } from '@/types/database.types';

/**
 * Content access levels for tiered content
 */
export type ContentAccessLevel = 'preview' | 'starter' | 'full';

/**
 * Determines the content access level based on subscription tier
 */
export function getContentAccessLevel(tier: SubscriptionTier | null | undefined): ContentAccessLevel {
  if (!tier || tier === 'free') {
    return 'preview';
  }
  if (tier === 'starter') {
    return 'starter';
  }
  // 'pro' and 'enterprise' get full access
  return 'full';
}

/**
 * Checks if user has at least starter-level access
 */
export function hasStarterAccess(tier: SubscriptionTier | null | undefined): boolean {
  const level = getContentAccessLevel(tier);
  return level === 'starter' || level === 'full';
}

/**
 * Checks if user has full (pro/enterprise) access
 */
export function hasFullAccess(tier: SubscriptionTier | null | undefined): boolean {
  return getContentAccessLevel(tier) === 'full';
}

/**
 * Gets the appropriate content based on tier
 * Falls back to available content if tier-specific content is missing
 */
export function getTieredContent(
  tier: SubscriptionTier | null | undefined,
  content: {
    free_preview?: string | null;
    starter_content?: string | null;
    pro_content?: string | null;
    content: string;
  }
): { content: string; accessLevel: ContentAccessLevel; hasDeepDive: boolean } {
  const accessLevel = getContentAccessLevel(tier);

  switch (accessLevel) {
    case 'preview':
      return {
        content: content.free_preview || content.content.slice(0, 500) + '...',
        accessLevel: 'preview',
        hasDeepDive: false,
      };

    case 'starter':
      return {
        content: content.starter_content || content.content,
        accessLevel: 'starter',
        hasDeepDive: !!content.pro_content,
      };

    case 'full':
      const fullContent = content.pro_content
        ? `${content.content}\n\n---\n\n## Deep Dive\n\n${content.pro_content}`
        : content.content;
      return {
        content: fullContent,
        accessLevel: 'full',
        hasDeepDive: !!content.pro_content,
      };
  }
}

/**
 * Tier display configuration
 */
export const TIER_DISPLAY: Record<SubscriptionTier, {
  label: string;
  description: string;
  features: string[];
}> = {
  free: {
    label: 'Free',
    description: "Today's tool preview only",
    features: ['Daily tool preview', 'Basic information'],
  },
  starter: {
    label: 'Starter',
    description: 'Full archive access',
    features: ['Full Tool of the Day archive', 'Detailed tool analysis', 'Business fit metrics'],
  },
  pro: {
    label: 'Pro',
    description: 'Everything + deep-dives',
    features: ['Everything in Starter', 'Technical deep-dives', 'Advanced analytics', 'Priority requests'],
  },
  enterprise: {
    label: 'Enterprise',
    description: 'Team access + API',
    features: ['Everything in Pro', 'Team access (10 seats)', 'API access', 'Custom research'],
  },
};
