import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/admin/StatsCard';
import {
  SparklesIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  FolderIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalSkills: number;
  globalSkills: number;
  localSkills: number;
  activeSkills: number;
  totalPosts: number;
  publishedPosts: number;
}

interface SkillStats {
  storage_location: string;
  is_active: boolean;
}

interface PostStats {
  is_published: boolean;
}

interface RecentSkill {
  id: string;
  slug: string;
  name: string;
  storage_location: string;
  created_at: string;
}

interface RecentPost {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Get skills stats
  const { data: skills } = await supabase.from('skills').select('storage_location, is_active');

  // Get posts stats
  const { data: posts } = await supabase.from('posts').select('is_published');

  const skillsData = (skills || []) as SkillStats[];
  const postsData = (posts || []) as PostStats[];

  return {
    totalSkills: skillsData.length,
    globalSkills: skillsData.filter((s) => s.storage_location === 'global').length,
    localSkills: skillsData.filter((s) => s.storage_location === 'local').length,
    activeSkills: skillsData.filter((s) => s.is_active).length,
    totalPosts: postsData.length,
    publishedPosts: postsData.filter((p) => p.is_published).length,
  };
}

async function getRecentSkills(): Promise<RecentSkill[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('skills')
    .select('id, slug, name, storage_location, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  return (data || []) as RecentSkill[];
}

async function getRecentPosts(): Promise<RecentPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, is_published, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  return (data || []) as RecentPost[];
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const recentSkills = await getRecentSkills();
  const recentPosts = await getRecentPosts();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-600 mt-1">
          Overview of your Breezybuild admin
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Skills"
          value={stats.totalSkills}
          icon={<SparklesIcon className="w-6 h-6" />}
          trend={`${stats.activeSkills} active`}
        />
        <StatsCard
          title="Global Skills"
          value={stats.globalSkills}
          icon={<GlobeAltIcon className="w-6 h-6" />}
          status="default"
        />
        <StatsCard
          title="Local Skills"
          value={stats.localSkills}
          icon={<FolderIcon className="w-6 h-6" />}
          status="default"
        />
        <StatsCard
          title="Posts"
          value={stats.totalPosts}
          icon={<DocumentTextIcon className="w-6 h-6" />}
          trend={`${stats.publishedPosts} published`}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/skills/new">
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Skill
            </Button>
          </Link>
          <Link href="/admin/posts/new">
            <Button variant="secondary" size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </Link>
          <form action="/api/skills/sync" method="POST" className="inline">
            <Button type="submit" variant="ghost" size="sm">
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Sync Skills
            </Button>
          </form>
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Skills */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">Recent Skills</h2>
            <Link
              href="/admin/skills"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          {recentSkills.length > 0 ? (
            <ul className="divide-y divide-zinc-100">
              {recentSkills.map((skill) => (
                <li key={skill.id} className="px-6 py-3 hover:bg-zinc-50">
                  <Link
                    href={`/admin/skills/${skill.slug}/edit`}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">{skill.name}</p>
                      <p className="text-sm text-zinc-500">
                        {skill.storage_location === 'global' ? 'Global' : 'Local'}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-400">
                      {new Date(skill.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-zinc-500">
              No skills yet
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">Recent Posts</h2>
            <Link
              href="/admin/posts"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          {recentPosts.length > 0 ? (
            <ul className="divide-y divide-zinc-100">
              {recentPosts.map((post) => (
                <li key={post.id} className="px-6 py-3 hover:bg-zinc-50">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">{post.title}</p>
                      <p className="text-sm text-zinc-500">
                        {post.is_published ? 'Published' : 'Draft'}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-400">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-zinc-500">
              No posts yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
