import { Card } from '@/components/ui/Card';
import { PROBLEMS } from '@/lib/constants';

export function ProblemSection() {
  return (
    <section id="problems" className="section-padding bg-zinc-50">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-zinc-900">
            {PROBLEMS.headline}
          </h2>
        </div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {PROBLEMS.items.map((item, index) => (
            <Card key={index} className="text-center">
              <div className="text-5xl mb-4">{item.icon}</div>
              <p className="text-lg font-semibold text-zinc-900 mb-2">
                {item.problem}
              </p>
              <p className="text-zinc-600">
                {item.pain}
              </p>
            </Card>
          ))}
        </div>

        {/* Agitation */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xl text-primary-dark font-medium mb-4">
            {PROBLEMS.agitation}
          </p>
          <p className="text-2xl md:text-3xl font-bold font-display text-gradient">
            {PROBLEMS.transition}
          </p>
        </div>
      </div>
    </section>
  );
}
