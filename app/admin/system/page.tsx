import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/admin/StatsCard';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ServerIcon,
  CircleStackIcon,
  CloudIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

interface SystemStatus {
  database: 'healthy' | 'error';
  skillsTable: 'exists' | 'missing';
  activityLogsTable: 'exists' | 'missing';
  tableCounts: {
    skills: number;
    posts: number;
    activityLogs: number;
  };
  globalSkillsPath: string;
  localSkillsPath: string;
}

async function getSystemStatus(): Promise<SystemStatus> {
  const supabase = await createClient();

  let database: 'healthy' | 'error' = 'healthy';
  let skillsTable: 'exists' | 'missing' = 'missing';
  let activityLogsTable: 'exists' | 'missing' = 'missing';
  const tableCounts = { skills: 0, posts: 0, activityLogs: 0 };

  try {
    // Check skills table
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('id', { count: 'exact', head: true });

    if (!skillsError) {
      skillsTable = 'exists';
      const { count } = await supabase
        .from('skills')
        .select('*', { count: 'exact', head: true });
      tableCounts.skills = count || 0;
    }

    // Check activity logs table
    const { error: logsError } = await supabase
      .from('admin_activity_logs')
      .select('id', { count: 'exact', head: true });

    if (!logsError) {
      activityLogsTable = 'exists';
      const { count } = await supabase
        .from('admin_activity_logs')
        .select('*', { count: 'exact', head: true });
      tableCounts.activityLogs = count || 0;
    }

    // Check posts table
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });
    tableCounts.posts = postsCount || 0;

  } catch (error) {
    database = 'error';
  }

  return {
    database,
    skillsTable,
    activityLogsTable,
    tableCounts,
    globalSkillsPath: '~/.claude/skills/',
    localSkillsPath: './skills/',
  };
}

export default async function SystemPage() {
  const status = await getSystemStatus();

  const StatusIcon = ({ healthy }: { healthy: boolean }) =>
    healthy ? (
      <CheckCircleIcon className="w-5 h-5 text-green-600" />
    ) : (
      <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-sand-900">System Status</h1>
        <p className="text-sand-600 mt-1">
          Monitor system health and configuration
        </p>
      </div>

      {/* Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-sand-200 p-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status.database === 'healthy' ? 'bg-green-100' : 'bg-red-100'}`}>
              <CircleStackIcon className={`w-6 h-6 ${status.database === 'healthy' ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="font-medium text-sand-900">Database</p>
              <p className={`text-sm ${status.database === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                {status.database === 'healthy' ? 'Connected' : 'Error'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-sand-200 p-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status.skillsTable === 'exists' ? 'bg-green-100' : 'bg-amber-100'}`}>
              <ServerIcon className={`w-6 h-6 ${status.skillsTable === 'exists' ? 'text-green-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <p className="font-medium text-sand-900">Skills Table</p>
              <p className={`text-sm ${status.skillsTable === 'exists' ? 'text-green-600' : 'text-amber-600'}`}>
                {status.skillsTable === 'exists' ? 'Ready' : 'Not Found'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-sand-200 p-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status.activityLogsTable === 'exists' ? 'bg-green-100' : 'bg-amber-100'}`}>
              <CloudIcon className={`w-6 h-6 ${status.activityLogsTable === 'exists' ? 'text-green-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <p className="font-medium text-sand-900">Activity Logs</p>
              <p className={`text-sm ${status.activityLogsTable === 'exists' ? 'text-green-600' : 'text-amber-600'}`}>
                {status.activityLogsTable === 'exists' ? 'Ready' : 'Not Found'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Counts */}
      <div className="bg-white rounded-xl border border-sand-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-sand-200">
          <h2 className="font-semibold text-sand-900">Database Tables</h2>
        </div>
        <table className="w-full">
          <thead className="bg-sand-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-sand-500 uppercase">
                Table
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-sand-500 uppercase">
                Status
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-sand-500 uppercase">
                Row Count
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            <tr>
              <td className="px-6 py-4 font-mono text-sm">skills</td>
              <td className="px-6 py-4">
                <StatusIcon healthy={status.skillsTable === 'exists'} />
              </td>
              <td className="px-6 py-4 text-right font-medium">
                {status.tableCounts.skills.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-mono text-sm">posts</td>
              <td className="px-6 py-4">
                <StatusIcon healthy={true} />
              </td>
              <td className="px-6 py-4 text-right font-medium">
                {status.tableCounts.posts.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-mono text-sm">admin_activity_logs</td>
              <td className="px-6 py-4">
                <StatusIcon healthy={status.activityLogsTable === 'exists'} />
              </td>
              <td className="px-6 py-4 text-right font-medium">
                {status.tableCounts.activityLogs.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* File Paths */}
      <div className="bg-white rounded-xl border border-sand-200 p-6">
        <h2 className="font-semibold text-sand-900 mb-4">Skill Storage Paths</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-sand-500">Global Skills Directory</p>
            <p className="font-mono text-sand-900 bg-sand-50 px-3 py-2 rounded">
              {status.globalSkillsPath}
            </p>
          </div>
          <div>
            <p className="text-sm text-sand-500">Local Skills Directory</p>
            <p className="font-mono text-sand-900 bg-sand-50 px-3 py-2 rounded">
              {status.localSkillsPath}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-sand-200 p-6">
        <h2 className="font-semibold text-sand-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <form action="/api/skills/sync" method="POST">
            <Button type="submit" variant="secondary">
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Sync Skills from Filesystem
            </Button>
          </form>
        </div>
        <p className="text-sm text-sand-500 mt-4">
          Sync will scan both global and local skill directories and update the database.
        </p>
      </div>

      {/* Environment Info */}
      <div className="bg-white rounded-xl border border-sand-200 p-6">
        <h2 className="font-semibold text-sand-900 mb-4">Environment</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-sand-500">Environment</dt>
            <dd className="font-medium text-sand-900">
              {process.env.NODE_ENV || 'development'}
            </dd>
          </div>
          <div>
            <dt className="text-sand-500">Supabase URL</dt>
            <dd className="font-medium text-sand-900 truncate">
              {process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/https?:\/\//, '').split('.')[0] || 'Not configured'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
