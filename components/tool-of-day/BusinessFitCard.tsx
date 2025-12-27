import {
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  RocketLaunchIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface BusinessFitCardProps {
  revenuePotential: string;
  executionDifficulty: number;
  goToMarketScore: number;
}

function getRevenueLabel(potential: string): string {
  switch (potential) {
    case '$$$': return '$1M-$10M ARR potential';
    case '$$': return '$100K-$1M ARR potential';
    case '$': return 'Side project revenue';
    default: return potential;
  }
}

function getDifficultyLabel(score: number): string {
  if (score >= 8) return 'Very Challenging';
  if (score >= 6) return 'Moderate complexity';
  if (score >= 4) return 'Manageable';
  return 'Straightforward';
}

export function BusinessFitCard({
  revenuePotential,
  executionDifficulty,
  goToMarketScore,
}: BusinessFitCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <h3 className="font-display text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Business Fit</h3>

      <div className="space-y-4">
        {/* Revenue Potential */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Revenue Potential</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{getRevenueLabel(revenuePotential)}</p>
            </div>
          </div>
          <span className="text-lg font-bold text-emerald-600">{revenuePotential}</span>
        </div>

        {/* Execution Difficulty */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WrenchScrewdriverIcon className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Execution Difficulty</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{getDifficultyLabel(executionDifficulty)}</p>
            </div>
          </div>
          <span className="text-lg font-bold text-primary-dark">{executionDifficulty}/10</span>
        </div>

        {/* Go-To-Market */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RocketLaunchIcon className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Go-To-Market</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Market opportunity</p>
            </div>
          </div>
          <span className="text-lg font-bold text-primary-dark">{goToMarketScore}/10</span>
        </div>

        {/* Right for You */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Right for You?</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">See if this tool fits your needs</p>
            </div>
          </div>
          <a href="#" className="text-sm font-medium text-primary-dark hover:text-primary">
            Find Out →
          </a>
        </div>
      </div>
    </div>
  );
}
