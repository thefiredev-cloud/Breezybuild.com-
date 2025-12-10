// Stripe configuration types for BreezyBuild

export interface TierConfig {
  name: string;
  price: number;
  description: string;
  features: string[];
}
