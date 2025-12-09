// Landing page type definitions

export type SubscriptionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface SubscriptionState {
  status: SubscriptionStatus;
  email?: string;
  error?: string;
}

export interface TrustSignal {
  label: string;
  description: string;
}

export interface Problem {
  icon: string;
  problem: string;
  pain: string;
}

export interface PricingTier {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
  cta: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  result: string;
  avatar: string;
}

export interface TransformationStage {
  time: string;
  title: string;
  description: string;
}

export interface NavLink {
  label: string;
  href: string;
}

// API Types
export interface SubscribeRequest {
  email: string;
  source?: string;
}

export interface SubscribeResponse {
  success: boolean;
  message: string;
}
