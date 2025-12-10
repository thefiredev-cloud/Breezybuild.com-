import { DateNavigation } from './DateNavigation';

interface ToolOfDayHeroProps {
  currentDate: string;
  previousDate: string | null;
  nextDate: string | null;
}

export function ToolOfDayHero({ currentDate, previousDate, nextDate }: ToolOfDayHeroProps) {
  return (
    <div className="text-center py-8 md:py-12">
      {/* Tool of the Day Title - Script Font Style */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-breezy-600 mb-6">
        Tool of the Day
      </h1>

      {/* Date Navigation */}
      <DateNavigation
        currentDate={currentDate}
        previousDate={previousDate}
        nextDate={nextDate}
      />
    </div>
  );
}
