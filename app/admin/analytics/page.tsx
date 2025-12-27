import { createClient } from '@/utils/supabase/server';
import { StatsCard } from '@/components/admin/StatsCard';
import {
  SparklesIcon,
  TagIcon,
  CalendarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

interface SkillData {
  tags: string[] | null;
  storage_location: string;
  is_active: boolean;
  created_at: string;
}

async function getAnalytics() {
  const supabase = await createClient();

  // Get all skills
  const { data: skills } = await supabase
    .from('skills')
    .select('tags, storage_location, is_active, created_at');

  const skillsData = (skills || []) as SkillData[];

  // Calculate tag distribution
  const tagCounts: Record<string, number> = {};
  skillsData.forEach((skill) => {
    (skill.tags || []).forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Sort tags by count
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Skills by month
  const skillsByMonth: Record<string, number> = {};
  skillsData.forEach((skill) => {
    const month = new Date(skill.created_at).toISOString().slice(0, 7);
    skillsByMonth[month] = (skillsByMonth[month] || 0) + 1;
  });

  // Location distribution
  const globalCount = skillsData.filter((s) => s.storage_location === 'global').length;
  const localCount = skillsData.filter((s) => s.storage_location === 'local').length;

  return {
    totalSkills: skillsData.length,
    activeSkills: skillsData.filter((s) => s.is_active).length,
    uniqueTags: Object.keys(tagCounts).length,
    topTags: sortedTags,
    skillsByMonth: Object.entries(skillsByMonth).sort((a, b) => a[0].localeCompare(b[0])),
    locationDistribution: { global: globalCount, local: localCount },
  };
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Analytics</h1>
        <p className="text-zinc-600 mt-1">
          Skills statistics and insights
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Skills"
          value={analytics.totalSkills}
          icon={<SparklesIcon className="w-6 h-6" />}
        />
        <StatsCard
          title="Active Skills"
          value={analytics.activeSkills}
          icon={<ChartBarIcon className="w-6 h-6" />}
          status="success"
        />
        <StatsCard
          title="Unique Tags"
          value={analytics.uniqueTags}
          icon={<TagIcon className="w-6 h-6" />}
        />
        <StatsCard
          title="This Month"
          value={analytics.skillsByMonth[analytics.skillsByMonth.length - 1]?.[1] || 0}
          icon={<CalendarIcon className="w-6 h-6" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Distribution */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Storage Location
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-600">Global</span>
                <span className="font-medium text-zinc-900">
                  {analytics.locationDistribution.global}
                </span>
              </div>
              <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{
                    width: `${analytics.totalSkills > 0 ? (analytics.locationDistribution.global / analytics.totalSkills) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-600">Local</span>
                <span className="font-medium text-zinc-900">
                  {analytics.locationDistribution.local}
                </span>
              </div>
              <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${analytics.totalSkills > 0 ? (analytics.locationDistribution.local / analytics.totalSkills) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Tags */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Top Tags
          </h2>
          {analytics.topTags.length > 0 ? (
            <div className="space-y-3">
              {analytics.topTags.map(([tag, count]) => (
                <div key={tag}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-600">{tag}</span>
                    <span className="font-medium text-zinc-900">{count}</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{
                        width: `${(count / analytics.topTags[0][1]) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-4">No tags yet</p>
          )}
        </div>
      </div>

      {/* Skills Over Time */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Skills Created Over Time
        </h2>
        {analytics.skillsByMonth.length > 0 ? (
          <div className="flex items-end gap-2 h-40">
            {analytics.skillsByMonth.map(([month, count]) => {
              const maxCount = Math.max(...analytics.skillsByMonth.map(([, c]) => c));
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={month} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-500 rounded-t"
                    style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0' }}
                  />
                  <span className="text-xs text-zinc-500 mt-2 rotate-45 origin-left">
                    {month.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-zinc-500 text-center py-8">No data yet</p>
        )}
      </div>
    </div>
  );
}
