import { ScoreCard } from './ScoreCard';
import { BusinessFitCard } from './BusinessFitCard';
import type { DailyResearch } from '@/types/database.types';

interface ToolSidebarProps {
  research: DailyResearch;
}

export function ToolSidebar({ research }: ToolSidebarProps) {
  return (
    <aside className="space-y-4">
      {/* Score Cards - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        <ScoreCard label="Opportunity" score={research.opportunity_score} />
        <ScoreCard label="Problem" score={research.problem_score} />
        <ScoreCard label="Feasibility" score={research.feasibility_score} />
        <ScoreCard label="Timing" score={research.timing_score} />
      </div>

      {/* Business Fit Card */}
      <BusinessFitCard
        revenuePotential={research.revenue_potential}
        executionDifficulty={research.execution_difficulty}
        goToMarketScore={research.go_to_market_score}
      />

      {/* Tool Info Card */}
      {(research.tool_url || research.tool_pricing) && (
        <div className="bg-white rounded-xl border border-sand-200 p-4">
          <h3 className="text-sm font-semibold text-sand-900 mb-3">Tool Info</h3>
          <div className="space-y-3">
            {research.tool_pricing && (
              <div>
                <p className="text-xs text-sand-500 uppercase tracking-wide mb-1">Pricing</p>
                <p className="text-sm font-medium text-sand-800">{research.tool_pricing}</p>
              </div>
            )}
            {research.tool_url && (
              <a
                href={research.tool_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2 px-4 bg-breezy-500 text-white text-sm font-semibold rounded-lg hover:bg-breezy-600 transition-colors"
              >
                Visit Tool →
              </a>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
