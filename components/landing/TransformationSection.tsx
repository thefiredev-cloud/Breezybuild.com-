import { TimelineStep } from '@/components/ui/TimelineStep';
import { TRANSFORMATION } from '@/lib/constants';

export function TransformationSection() {
  return (
    <section id="transformation" className="section-padding bg-white">
      <div className="container-tight">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-sand-900">
            {TRANSFORMATION.headline}
          </h2>
        </div>

        {/* Timeline */}
        <div className="max-w-xl mx-auto">
          {TRANSFORMATION.stages.map((stage, index) => (
            <TimelineStep
              key={index}
              stage={stage}
              isLast={index === TRANSFORMATION.stages.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
