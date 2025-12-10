import { ScoreValues } from '@/types/tool-content';

interface ScoreBadgesProps {
  scores: ScoreValues;
  compact?: boolean;
}

// Helper function to get color based on score
function getScoreColor(score: number): string {
  if (score < 3) return 'red';
  if (score === 3) return 'yellow';
  return 'green';
}

// Helper to get Tailwind classes for color
function getColorClasses(color: string): { bg: string; text: string; ring: string } {
  switch (color) {
    case 'red':
      return {
        bg: 'bg-red-100 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-400',
        ring: 'ring-red-500/20'
      };
    case 'yellow':
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/20',
        text: 'text-amber-700 dark:text-amber-400',
        ring: 'ring-amber-500/20'
      };
    case 'green':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-900/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        ring: 'ring-emerald-500/20'
      };
    default:
      return {
        bg: 'bg-stone-100 dark:bg-stone-800',
        text: 'text-stone-700 dark:text-stone-400',
        ring: 'ring-stone-500/20'
      };
  }
}

// Individual score badge component
function ScoreBadge({ label, score, compact = false }: { label: string; score: number; compact?: boolean }) {
  const color = getScoreColor(score);
  const colors = getColorClasses(color);
  const percentage = (score / 5) * 100;

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${colors.bg} ${colors.text} text-xs font-medium`}>
        <span>{label}:</span>
        <span className="font-bold">{score}/5</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl ${colors.bg} ${colors.text} ring-1 ${colors.ring} transition-all hover:scale-105`}>
      {/* Circular progress indicator */}
      <div className="relative w-12 h-12">
        <svg className="transform -rotate-90 w-12 h-12" viewBox="0 0 48 48">
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - percentage / 100)}`}
            className="transition-all duration-500"
            strokeLinecap="round"
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{score}</span>
        </div>
      </div>
      {/* Label */}
      <span className="text-xs font-medium text-center whitespace-nowrap">{label}</span>
    </div>
  );
}

export default function ScoreBadges({ scores, compact = false }: ScoreBadgesProps) {
  return (
    <div className={`flex flex-wrap gap-3 ${compact ? 'justify-start' : 'justify-center sm:justify-start'}`}>
      <ScoreBadge label="Learning Curve" score={scores.learning_curve} compact={compact} />
      <ScoreBadge label="Ecosystem" score={scores.ecosystem} compact={compact} />
      <ScoreBadge label="Maturity" score={scores.maturity} compact={compact} />
      <ScoreBadge label="Value" score={scores.cost_value} compact={compact} />
    </div>
  );
}
