import { createClient } from '@/utils/supabase/server';
import { StatusBadge } from '@/components/admin/StatusBadge';

export const dynamic = 'force-dynamic';

interface ActivityLog {
  id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  created_at: string;
}

async function getActivityLogs(): Promise<ActivityLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('admin_activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching logs:', error);
    return [];
  }

  return data as ActivityLog[];
}

interface SkillChange {
  id: string;
  slug: string;
  name: string;
  updated_at: string;
  created_at: string;
}

async function getRecentSkillChanges(): Promise<SkillChange[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('skills')
    .select('id, slug, name, updated_at, created_at')
    .order('updated_at', { ascending: false })
    .limit(10);

  return (data || []) as SkillChange[];
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default async function LogsPage() {
  const activityLogs = await getActivityLogs();
  const recentSkillChanges = await getRecentSkillChanges();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-sand-900">Activity Logs</h1>
        <p className="text-sand-600 mt-1">
          Track admin actions and changes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Skill Changes */}
        <div className="bg-white rounded-xl border border-sand-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-sand-200">
            <h2 className="font-semibold text-sand-900">Recent Skill Changes</h2>
          </div>
          {recentSkillChanges.length > 0 ? (
            <ul className="divide-y divide-sand-100">
              {recentSkillChanges.map((skill) => {
                const isNew =
                  new Date(skill.created_at).getTime() ===
                  new Date(skill.updated_at).getTime();
                return (
                  <li key={skill.id} className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          isNew ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sand-900">
                          <span className="font-medium">{skill.name}</span>
                          {isNew ? ' was created' : ' was updated'}
                        </p>
                        <p className="text-sm text-sand-500">
                          {formatRelativeTime(skill.updated_at)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-sand-500">
              No recent changes
            </div>
          )}
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-xl border border-sand-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-sand-200">
            <h2 className="font-semibold text-sand-900">Activity Log</h2>
          </div>
          {activityLogs.length > 0 ? (
            <ul className="divide-y divide-sand-100 max-h-[600px] overflow-y-auto">
              {activityLogs.map((log) => (
                <li key={log.id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-breezy-500" />
                    <div className="flex-1">
                      <p className="text-sand-900">
                        <span className="font-medium">{log.entity_type}</span>
                        {' '}{log.action}
                        {log.entity_name && (
                          <>: <span className="font-medium">{log.entity_name}</span></>
                        )}
                      </p>
                      <p className="text-sm text-sand-500">
                        {log.user_email} &bull; {formatRelativeTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-sand-500">
              <p>No activity logs yet</p>
              <p className="text-sm mt-2">
                Activity will be logged when you create, update, or delete skills.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
