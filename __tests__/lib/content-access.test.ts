import {
  getContentAccessLevel,
  hasStarterAccess,
  hasFullAccess,
  getTieredContent,
  TIER_DISPLAY,
} from '@/lib/content-access';
import type { SubscriptionTier } from '@/types/database.types';

describe('content-access', () => {
  describe('getContentAccessLevel', () => {
    it('returns preview for null tier', () => {
      expect(getContentAccessLevel(null)).toBe('preview');
    });

    it('returns preview for undefined tier', () => {
      expect(getContentAccessLevel(undefined)).toBe('preview');
    });

    it('returns preview for free tier', () => {
      expect(getContentAccessLevel('free')).toBe('preview');
    });

    it('returns starter for starter tier', () => {
      expect(getContentAccessLevel('starter' as SubscriptionTier)).toBe('starter');
    });

    it('returns full for pro tier', () => {
      expect(getContentAccessLevel('pro')).toBe('full');
    });

    it('returns full for enterprise tier', () => {
      expect(getContentAccessLevel('enterprise')).toBe('full');
    });
  });

  describe('hasStarterAccess', () => {
    it('returns false for null tier', () => {
      expect(hasStarterAccess(null)).toBe(false);
    });

    it('returns false for free tier', () => {
      expect(hasStarterAccess('free')).toBe(false);
    });

    it('returns true for starter tier', () => {
      expect(hasStarterAccess('starter' as SubscriptionTier)).toBe(true);
    });

    it('returns true for pro tier', () => {
      expect(hasStarterAccess('pro')).toBe(true);
    });

    it('returns true for enterprise tier', () => {
      expect(hasStarterAccess('enterprise')).toBe(true);
    });
  });

  describe('hasFullAccess', () => {
    it('returns false for null tier', () => {
      expect(hasFullAccess(null)).toBe(false);
    });

    it('returns false for free tier', () => {
      expect(hasFullAccess('free')).toBe(false);
    });

    it('returns false for starter tier', () => {
      expect(hasFullAccess('starter' as SubscriptionTier)).toBe(false);
    });

    it('returns true for pro tier', () => {
      expect(hasFullAccess('pro')).toBe(true);
    });

    it('returns true for enterprise tier', () => {
      expect(hasFullAccess('enterprise')).toBe(true);
    });
  });

  describe('getTieredContent', () => {
    const mockContent = {
      content: 'This is the full content that is quite long and detailed.',
      free_preview: 'This is the free preview.',
      starter_content: 'This is the starter content with more details.',
      pro_content: 'This is the pro deep dive with advanced insights.',
    };

    describe('preview access (free tier)', () => {
      it('returns free_preview when available', () => {
        const result = getTieredContent('free', mockContent);
        expect(result.content).toBe('This is the free preview.');
        expect(result.accessLevel).toBe('preview');
        expect(result.hasDeepDive).toBe(false);
      });

      it('returns truncated content when free_preview is null', () => {
        const contentWithoutPreview = { ...mockContent, free_preview: null };
        const result = getTieredContent('free', contentWithoutPreview);
        expect(result.content).toContain('...');
        expect(result.accessLevel).toBe('preview');
      });

      it('returns truncated content for null tier', () => {
        const contentWithoutPreview = { ...mockContent, free_preview: null };
        const result = getTieredContent(null, contentWithoutPreview);
        expect(result.accessLevel).toBe('preview');
      });
    });

    describe('starter access', () => {
      it('returns starter_content when available', () => {
        const result = getTieredContent('starter' as SubscriptionTier, mockContent);
        expect(result.content).toBe('This is the starter content with more details.');
        expect(result.accessLevel).toBe('starter');
        expect(result.hasDeepDive).toBe(true);
      });

      it('falls back to main content when starter_content is null', () => {
        const contentWithoutStarter = { ...mockContent, starter_content: null };
        const result = getTieredContent('starter' as SubscriptionTier, contentWithoutStarter);
        expect(result.content).toBe(mockContent.content);
        expect(result.accessLevel).toBe('starter');
      });

      it('indicates no deep dive when pro_content is null', () => {
        const contentWithoutPro = { ...mockContent, pro_content: null };
        const result = getTieredContent('starter' as SubscriptionTier, contentWithoutPro);
        expect(result.hasDeepDive).toBe(false);
      });
    });

    describe('full access (pro/enterprise)', () => {
      it('returns combined content with deep dive for pro tier', () => {
        const result = getTieredContent('pro', mockContent);
        expect(result.content).toContain('This is the full content');
        expect(result.content).toContain('## Deep Dive');
        expect(result.content).toContain('This is the pro deep dive');
        expect(result.accessLevel).toBe('full');
        expect(result.hasDeepDive).toBe(true);
      });

      it('returns combined content with deep dive for enterprise tier', () => {
        const result = getTieredContent('enterprise', mockContent);
        expect(result.content).toContain('## Deep Dive');
        expect(result.accessLevel).toBe('full');
        expect(result.hasDeepDive).toBe(true);
      });

      it('returns just main content when pro_content is null', () => {
        const contentWithoutPro = { ...mockContent, pro_content: null };
        const result = getTieredContent('pro', contentWithoutPro);
        expect(result.content).toBe(mockContent.content);
        expect(result.content).not.toContain('## Deep Dive');
        expect(result.hasDeepDive).toBe(false);
      });
    });
  });

  describe('TIER_DISPLAY', () => {
    it('has configuration for all tiers', () => {
      expect(TIER_DISPLAY.free).toBeDefined();
      expect(TIER_DISPLAY.pro).toBeDefined();
      expect(TIER_DISPLAY.enterprise).toBeDefined();
    });

    it('each tier has required properties', () => {
      const tiers: SubscriptionTier[] = ['free', 'pro', 'enterprise'];
      tiers.forEach((tier) => {
        expect(TIER_DISPLAY[tier].label).toBeDefined();
        expect(TIER_DISPLAY[tier].description).toBeDefined();
        expect(Array.isArray(TIER_DISPLAY[tier].features)).toBe(true);
        expect(TIER_DISPLAY[tier].features.length).toBeGreaterThan(0);
      });
    });
  });
});
