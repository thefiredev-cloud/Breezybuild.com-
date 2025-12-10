interface ScoreCardProps {
  label: string;
  score: number;
  maxScore?: number;
}

const SCORE_COLORS = {
  high: 'bg-emerald-500',
  medium: 'bg-breezy-500',
  low: 'bg-red-400',
};

const SCORE_DESCRIPTIONS: Record<string, Record<number, string>> = {
  opportunity: { 9: 'Exceptional', 8: 'Exceptional', 7: 'Strong', 6: 'Strong', 5: 'Moderate', 4: 'Moderate', 3: 'Limited', 2: 'Limited', 1: 'Minimal' },
  problem: { 9: 'Severe Pain', 8: 'Severe Pain', 7: 'Significant', 6: 'Significant', 5: 'Moderate', 4: 'Moderate', 3: 'Minor', 2: 'Minor', 1: 'Minimal' },
  feasibility: { 9: 'Very Easy', 8: 'Easy', 7: 'Doable', 6: 'Doable', 5: 'Challenging', 4: 'Challenging', 3: 'Hard', 2: 'Hard', 1: 'Very Hard' },
  timing: { 9: 'Perfect', 8: 'Perfect', 7: 'Good', 6: 'Good', 5: 'Okay', 4: 'Okay', 3: 'Early/Late', 2: 'Early/Late', 1: 'Wrong Time' },
};

function getScoreColor(score: number): string {
  if (score >= 7) return SCORE_COLORS.high;
  if (score >= 4) return SCORE_COLORS.medium;
  return SCORE_COLORS.low;
}

function getScoreDescription(label: string, score: number): string {
  const key = label.toLowerCase().replace(/\s+/g, '_');
  const descriptions = SCORE_DESCRIPTIONS[key];
  if (!descriptions) return '';
  return descriptions[score] || '';
}

export function ScoreCard({ label, score, maxScore = 10 }: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  const description = getScoreDescription(label, score);
  const colorClass = getScoreColor(score);

  return (
    <div className="bg-white rounded-xl border border-sand-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-sand-500 uppercase tracking-wide">{label}</span>
        <span className="text-xs text-sand-400">ⓘ</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-sand-900">{score}</span>
        {description && (
          <span className="text-sm text-sand-600">{description}</span>
        )}
      </div>
      <div className="h-1.5 bg-sand-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
