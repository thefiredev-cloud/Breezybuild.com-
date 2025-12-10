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
    <div className="bg-white rounded-xl border border-sand-200 p-4">
      <h3 className="text-sm font-semibold text-sand-900 mb-4">Business Fit</h3>

      <div className="space-y-4">
        {/* Revenue Potential */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-sand-800">Revenue Potential</p>
              <p className="text-xs text-sand-500">{getRevenueLabel(revenuePotential)}</p>
            </div>
          </div>
          <span className="text-lg font-bold text-emerald-600">{revenuePotential}</span>
        </div>

        {/* Execution Difficulty */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WrenchScrewdriverIcon className="w-5 h-5 text-breezy-500" />
            <div>
              <p className="text-sm font-medium text-sand-800">Execution Difficulty</p>
              <p className="text-xs text-sand-500">{getDifficultyLabel(executionDifficulty)}</p>
            </div>
          </div>
          <span className="text-lg font-bold text-breezy-600">{executionDifficulty}/10</span>
        </div>

        {/* Go-To-Market */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RocketLaunchIcon className="w-5 h-5 text-warm-500" />
            <div>
              <p className="text-sm font-medium text-sand-800">Go-To-Market</p>
              <p className="text-xs text-sand-500">Market opportunity</p>
            </div>
          </div>
          <span className="text-lg font-bold text-warm-600">{goToMarketScore}/10</span>
        </div>

        {/* Right for You */}
        <div className="flex items-center justify-between pt-2 border-t border-sand-100">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-sand-400" />
            <div>
              <p className="text-sm font-medium text-sand-800">Right for You?</p>
              <p className="text-xs text-sand-500">See if this tool fits your needs</p>
            </div>
          </div>
          <a href="#" className="text-sm font-medium text-breezy-600 hover:text-breezy-700">
            Find Out →
          </a>
        </div>
      </div>
    </div>
  );
}
