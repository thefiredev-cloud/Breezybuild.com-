import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/Button';
import { StatusBadge, LocationBadge } from '@/components/admin/StatusBadge';
import {
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  storage_location: 'global' | 'local';
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

async function getSkills(): Promise<Skill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching skills:', error);
    return [];
  }

  return data as Skill[];
}

export default async function SkillsPage() {
  const skills = await getSkills();

  const globalCount = skills.filter((s) => s.storage_location === 'global').length;
  const localCount = skills.filter((s) => s.storage_location === 'local').length;
  const activeCount = skills.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Skills</h1>
          <p className="text-zinc-600 mt-1">
            Manage Claude skill MD files ({skills.length} total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action="/api/skills/sync" method="POST">
            <Button type="submit" variant="secondary" size="sm">
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Sync from Files
            </Button>
          </form>
          <Link href="/admin/skills/new">
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Skill
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Total Skills</p>
          <p className="text-2xl font-bold text-zinc-900">{skills.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Global</p>
          <p className="text-2xl font-bold text-purple-600">{globalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Local</p>
          <p className="text-2xl font-bold text-blue-600">{localCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
      </div>

      {/* Skills Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {skills.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-500 mb-4">No skills found</p>
            <p className="text-sm text-zinc-400 mb-6">
              Create a new skill or sync existing skills from the file system.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/admin/skills/new">
                <Button>Create Skill</Button>
              </Link>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">
                  Location
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">
                  Tags
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {skills.map((skill) => (
                <tr key={skill.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-zinc-900">{skill.name}</p>
                      <p className="text-sm text-zinc-500 truncate max-w-md">
                        {skill.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <LocationBadge location={skill.storage_location} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={skill.is_active ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {skill.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {skill.tags.length > 3 && (
                        <span className="text-xs text-zinc-400">
                          +{skill.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/skills/${skill.slug}/edit`}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
