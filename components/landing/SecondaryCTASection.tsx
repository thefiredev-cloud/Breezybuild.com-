import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SECONDARY_CTA } from '@/lib/constants';

export function SecondaryCTASection() {
  return (
    <section id="cta" className="section-padding bg-gradient-primary text-white">
      <div className="container-tight text-center">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
          {SECONDARY_CTA.headline}
        </h2>

        {/* Subheadline */}
        <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
          {SECONDARY_CTA.subheadline}
        </p>

        {/* CTA button */}
        <Link href="/login">
          <Button
            size="lg"
            className="bg-white text-primary-dark hover:bg-primary-50 shadow-lg"
          >
            {SECONDARY_CTA.cta}
          </Button>
        </Link>
      </div>
    </section>
  );
}
