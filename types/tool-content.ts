// TypeScript types for BreezyBuild Tool of the Day content
// Aligned with daily_research table in Supabase

export interface UseCase {
  title: string;
  description: string;
}

export interface QuickStartStep {
  step: number;
  title: string;
  description: string;
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
}

export type ToolCategory =
  | 'ai_coding'
  | 'ai_design'
  | 'devops'
  | 'productivity'
  | 'database'
  | 'hardware_robotics'
  | 'ai_general';

export type PipelineStatus = 'queued' | 'researching' | 'ready' | 'published' | 'failed';

export interface ScoreValues {
  learning_curve: number; // 1-5: 1=hard (red), 5=easy (green)
  ecosystem: number; // 1-5: quality of integrations, plugins, extensions
  maturity: number; // 1-5: production readiness, stability
  cost_value: number; // 1-5: cost effectiveness for value provided
}

export interface ToolContent {
  id: string;
  topic_id: string | null;
  research_date: string;
  title: string;
  summary: string | null;
  content: string;

  // Structured tool content
  tagline: string | null;
  what_it_is: string | null;
  why_it_matters: string | null;
  use_cases: UseCase[] | null;
  quick_start_guide: QuickStartStep[] | null;
  pro_tips: string[] | null;
  gotchas: string[] | null;

  // Scores (1-5 scale)
  score_learning_curve: number | null;
  score_ecosystem: number | null;
  score_maturity: number | null;
  score_cost_value: number | null;

  // Legacy scores (1-10 scale)
  opportunity_score: number | null;
  problem_score: number | null;
  feasibility_score: number | null;
  timing_score: number | null;

  // Community
  community_size: string | null;
  community_sentiment: string | null;
  notable_users: string[] | null;

  // Pricing
  pricing_model: string | null;
  pricing_tiers: PricingTier[] | null;
  tool_pricing: string | null;

  // Links
  official_url: string | null;
  documentation_url: string | null;
  github_url: string | null;
  tool_url: string | null;

  // Metadata
  tags: string[] | null;
  category: ToolCategory | null;
  pipeline_status: PipelineStatus | null;
  is_published: boolean;
  is_featured: boolean;

  // Raw data
  sources: Record<string, unknown>[] | null;
  raw_perplexity: Record<string, unknown> | null;
  perplexity_citations: string[] | null;

  created_at: string;
}

// Helper to extract scores object from ToolContent
export function getScores(tool: ToolContent): ScoreValues {
  return {
    learning_curve: tool.score_learning_curve || 3,
    ecosystem: tool.score_ecosystem || 3,
    maturity: tool.score_maturity || 3,
    cost_value: tool.score_cost_value || 3,
  };
}

// Navigation types
export interface DateNavigationProps {
  currentDate: string;
  hasPrevious: boolean;
  hasNext: boolean;
  previousDate: string | null;
  nextDate: string | null;
}

export interface ToolWithNavigation {
  tool: ToolContent;
  navigation: DateNavigationProps;
}
