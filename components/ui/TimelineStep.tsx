import type { TransformationStage } from '@/types/landing.types';

interface TimelineStepProps {
  stage: TransformationStage;
  isLast?: boolean;
}

export function TimelineStep({ stage, isLast = false }: TimelineStepProps) {
  const { time, title, description } = stage;

  return (
    <div className="relative flex gap-4 md:gap-6">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-gradient-cta flex items-center justify-center text-white font-bold text-sm shadow-warm">
          {time.split(' ')[0]}
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-gradient-to-b from-primary-400 to-primary-100 mt-2" />
        )}
      </div>

      {/* Content */}
      <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
        <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
          {time}
        </span>
        <h3 className="text-xl font-semibold text-zinc-900 mt-1">{title}</h3>
        <p className="text-zinc-600 mt-2 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
