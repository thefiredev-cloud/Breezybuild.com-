/**
 * Database Type Definitions
 * Auto-generated types matching the PostgreSQL schema
 *
 * These types correspond to the tables in:
 * /supabase/migrations/20250106_newsletter_platform_schema.sql
 */

// =====================================================
// ENUMS
// =====================================================

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'trial'
  | 'past_due';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type NewsletterStatus =
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'archived';

export type DeliveryFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'custom';

export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

// =====================================================
// TABLE TYPES
// =====================================================

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  bio: string | null;
  website: string | null;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface SubscriptionTierConfig {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_newsletters_per_month: number | null;
  max_subscribers: number | null;
  can_customize_branding: boolean;
  has_analytics: boolean;
  has_priority_support: boolean;
  has_api_access: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle | null;
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  cancelled_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  subscription_id: string | null;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_invoice_id: string | null;
  description: string | null;
  receipt_url: string | null;
  failure_reason: string | null;
  refunded_amount: number;
  refunded_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Newsletter {
  id: string;
  author_id: string | null;
  title: string;
  slug: string;
  subject_line: string;
  preview_text: string | null;
  content_html: string;
  content_text: string | null;
  status: NewsletterStatus;
  published_at: string | null;
  scheduled_for: string | null;
  views_count: number;
  opens_count: number;
  clicks_count: number;
  meta_description: string | null;
  featured_image_url: string | null;
  tags: string[];
  is_featured: boolean;
  is_premium: boolean;
  required_tier: SubscriptionTier | null;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  newsletter_id: string;
  user_id: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  unsubscribed_at: string | null;
  bounced_at: string | null;
  complained_at: string | null;
  created_at: string;
}

export interface SubscriberPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  delivery_frequency: DeliveryFrequency;
  preferred_delivery_time: string;
  preferred_timezone: string;
  categories: string[];
  tags: string[];
  notify_new_newsletter: boolean;
  notify_featured_content: boolean;
  notify_premium_only: boolean;
  marketing_emails_enabled: boolean;
  product_updates_enabled: boolean;
  html_emails: boolean;
  text_only_emails: boolean;
  unsubscribed_at: string | null;
  unsubscribe_reason: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INSERT TYPES (for creating new records)
// =====================================================

export type ProfileInsert = Omit<
  Profile,
  'id' | 'created_at' | 'updated_at' | 'email_verified' | 'is_active'
> & {
  id?: string;
  email_verified?: boolean;
  is_active?: boolean;
};

export type SubscriptionInsert = Omit<
  Subscription,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

export type PaymentInsert = Omit<
  Payment,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

export type NewsletterInsert = Omit<
  Newsletter,
  'id' | 'created_at' | 'updated_at' | 'views_count' | 'opens_count' | 'clicks_count'
> & {
  id?: string;
  views_count?: number;
  opens_count?: number;
  clicks_count?: number;
};

export type NewsletterSubscriberInsert = Omit<
  NewsletterSubscriber,
  'id' | 'created_at'
> & {
  id?: string;
};

export type SubscriberPreferencesInsert = Omit<
  SubscriberPreferences,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

// =====================================================
// UPDATE TYPES (for updating records)
// =====================================================

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type SubscriptionUpdate = Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type PaymentUpdate = Partial<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>;

export type NewsletterUpdate = Partial<Omit<Newsletter, 'id' | 'created_at' | 'updated_at'>>;

export type NewsletterSubscriberUpdate = Partial<Omit<NewsletterSubscriber, 'id' | 'newsletter_id' | 'user_id' | 'created_at'>>;

export type SubscriberPreferencesUpdate = Partial<Omit<SubscriberPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// =====================================================
// JOINED/EXTENDED TYPES (for queries with joins)
// =====================================================

export interface NewsletterWithAuthor extends Newsletter {
  author?: Pick<Profile, 'full_name' | 'avatar_url' | 'email'>;
}

export interface SubscriptionWithTier extends Subscription {
  tier_config?: SubscriptionTierConfig;
}

export interface NewsletterWithStats extends Newsletter {
  total_sent: number;
  total_opens: number;
  total_clicks: number;
  open_rate: number;
  click_rate: number;
}

export interface ProfileWithSubscription extends Profile {
  subscription?: SubscriptionWithTier;
  has_active_subscription: boolean;
}

// =====================================================
// HELPER FUNCTION RETURN TYPES
// =====================================================

export interface NewsletterAnalytics {
  newsletter_id: string;
  title: string;
  views_count: number;
  opens_count: number;
  clicks_count: number;
  total_sent: number;
  total_opens: number;
  total_clicks: number;
  open_rate: number;
  click_rate: number;
}

export interface UserSubscriptionInfo {
  has_subscription: boolean;
  tier: SubscriptionTier;
  status: SubscriptionStatus | null;
  period_end: string | null;
  auto_renew: boolean;
}

// =====================================================
// REQUEST/RESPONSE TYPES (for API)
// =====================================================

export interface CreateNewsletterRequest {
  title: string;
  subject_line: string;
  content_html: string;
  content_text?: string;
  preview_text?: string;
  tags?: string[];
  is_premium?: boolean;
  required_tier?: SubscriptionTier;
  status?: NewsletterStatus;
  scheduled_for?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  avatar_url?: string;
  company_name?: string;
  bio?: string;
  website?: string;
}

export interface UpdatePreferencesRequest {
  email_enabled?: boolean;
  delivery_frequency?: DeliveryFrequency;
  preferred_delivery_time?: string;
  preferred_timezone?: string;
  categories?: string[];
  tags?: string[];
  notify_new_newsletter?: boolean;
  notify_featured_content?: boolean;
  marketing_emails_enabled?: boolean;
  product_updates_enabled?: boolean;
}

export interface SubscribeToNewsletterRequest {
  newsletter_id: string;
}

export interface CreateSubscriptionRequest {
  tier: SubscriptionTier;
  billing_cycle: BillingCycle;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

// =====================================================
// SUPABASE DATABASE TYPE (for type-safe queries)
// =====================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      subscription_tiers: {
        Row: SubscriptionTierConfig;
        Insert: Omit<SubscriptionTierConfig, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SubscriptionTierConfig, 'id' | 'created_at' | 'updated_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: SubscriptionInsert;
        Update: SubscriptionUpdate;
      };
      payments: {
        Row: Payment;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
      };
      newsletters: {
        Row: Newsletter;
        Insert: NewsletterInsert;
        Update: NewsletterUpdate;
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: NewsletterSubscriberInsert;
        Update: NewsletterSubscriberUpdate;
      };
      subscriber_preferences: {
        Row: SubscriberPreferences;
        Insert: SubscriberPreferencesInsert;
        Update: SubscriberPreferencesUpdate;
      };
      email_leads: {
        Row: {
          id: string;
          email: string;
          source: string;
          subscribed_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string;
          subscribed_at?: string;
        };
        Update: {
          email?: string;
          source?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          category: string;
          featured_image_url: string | null;
          published_at: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          category?: string;
          featured_image_url?: string | null;
          published_at?: string | null;
          is_published?: boolean;
        };
        Update: {
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          category?: string;
          featured_image_url?: string | null;
          published_at?: string | null;
          is_published?: boolean;
        };
      };
      research_topics: {
        Row: ResearchTopic;
        Insert: Omit<ResearchTopic, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<ResearchTopic, 'id' | 'created_at'>>;
      };
      daily_research: {
        Row: DailyResearch;
        Insert: Omit<DailyResearch, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<DailyResearch, 'id' | 'created_at'>>;
      };
    };
    Functions: {
      has_active_subscription: {
        Args: { check_user_id: string };
        Returns: boolean;
      };
      get_user_subscription_tier: {
        Args: { check_user_id: string };
        Returns: SubscriptionTier;
      };
      increment_newsletter_stat: {
        Args: {
          newsletter_uuid: string;
          stat_type: 'view' | 'open' | 'click';
        };
        Returns: void;
      };
    };
  };
}

// =====================================================
// TYPE GUARDS
// =====================================================

export function isSubscriptionTier(value: string): value is SubscriptionTier {
  return ['free', 'pro', 'enterprise'].includes(value);
}

export function isNewsletterStatus(value: string): value is NewsletterStatus {
  return ['draft', 'scheduled', 'published', 'archived'].includes(value);
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return ['pending', 'completed', 'failed', 'refunded', 'cancelled'].includes(value);
}

// =====================================================
// DAILY RESEARCH TYPES
// =====================================================

export interface ResearchTopic {
  id: string;
  name: string;
  slug: string;
  search_query: string;
  is_active: boolean;
  priority: number;
  created_at: string;
}

export interface DailyResearch {
  id: string;
  topic_id: string;
  research_date: string;
  title: string;
  summary: string | null;
  content: string;
  sources: string[];
  raw_perplexity: Record<string, unknown> | null;
  is_published: boolean;
  created_at: string;
  // Tool of the Day score fields
  opportunity_score: number;
  problem_score: number;
  feasibility_score: number;
  timing_score: number;
  revenue_potential: string;
  execution_difficulty: number;
  go_to_market_score: number;
  tags: string[];
  tool_url: string | null;
  tool_pricing: string | null;
  is_featured: boolean;
}

export interface DailyResearchWithTopic extends DailyResearch {
  topic: ResearchTopic;
}
