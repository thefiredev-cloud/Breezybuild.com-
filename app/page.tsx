import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { TransformationSection } from '@/components/landing/TransformationSection';
import { SecondaryCTASection } from '@/components/landing/SecondaryCTASection';
import { FooterSection } from '@/components/landing/FooterSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Section 1: Hero */}
      <HeroSection />

      {/* Section 2: Problem-Agitate */}
      <ProblemSection />

      {/* Section 3: Pricing */}
      <PricingSection />

      {/* Section 4: Social Proof */}
      <SocialProofSection />

      {/* Section 5: Transformation */}
      <TransformationSection />

      {/* Section 6: Secondary CTA */}
      <SecondaryCTASection />

      {/* Section 7: Footer */}
      <FooterSection />
    </main>
  );
}
