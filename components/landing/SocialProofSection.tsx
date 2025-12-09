import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { TESTIMONIALS } from '@/lib/constants';

export function SocialProofSection() {
  return (
    <section id="testimonials" className="section-padding bg-sand-50">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-sand-900">
            {TESTIMONIALS.headline}
          </h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.items.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
