import { Badge } from './Badge';
import { Card } from './Card';
import type { Testimonial } from '@/types/landing.types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const { quote, author, role, result, avatar } = testimonial;

  // Generate color based on initials
  const getColor = (initials: string) => {
    const colors = [
      'bg-primary-500',
      'bg-warm-500',
      'bg-emerald-500',
      'bg-blue-500',
      'bg-purple-500',
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Quote */}
      <div className="flex-1 mb-4">
        <svg className="w-8 h-8 text-primary-200 mb-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p className="text-zinc-700 leading-relaxed">{quote}</p>
      </div>

      {/* Result badge */}
      <div className="mb-4">
        <Badge variant="default">{result}</Badge>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getColor(avatar)}`}
        >
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-zinc-900">{author}</p>
          <p className="text-sm text-zinc-500">{role}</p>
        </div>
      </div>
    </Card>
  );
}
