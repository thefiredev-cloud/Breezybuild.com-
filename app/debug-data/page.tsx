import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

type TopicRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  priority: number;
};

type ResearchRow = {
  id: string;
  title: string;
  research_date: string;
  is_published: boolean;
  topic_id: string | null;
  created_at: string;
};

export default async function DebugDataPage() {
  const supabase = await createClient();

  // Get ALL research_topics (not filtered by is_active)
  const { data: topicsData, error: topicsError } = await supabase
    .from('research_topics')
    .select('*')
    .order('name');

  const topics = topicsData as TopicRow[] | null;

  // Get ALL daily_research (both published and unpublished)
  const { data: researchData, error: researchError } = await supabase
    .from('daily_research')
    .select(`
      id,
      title,
      research_date,
      is_published,
      topic_id,
      created_at
    `)
    .order('created_at', { ascending: false });

  const research = researchData as ResearchRow[] | null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Database Debug</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Research Topics */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">
            Research Topics ({topics?.length ?? 0})
          </h2>
          {topicsError && (
            <pre className="bg-red-100 p-2 rounded text-sm mb-4">
              {JSON.stringify(topicsError, null, 2)}
            </pre>
          )}
          <div className="space-y-2">
            {topics?.map((topic) => (
              <div
                key={topic.id}
                className={`p-3 rounded border ${topic.is_active ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
              >
                <div className="font-medium">{topic.name}</div>
                <div className="text-sm text-gray-500">
                  slug: {topic.slug} | is_active: {topic.is_active ? 'true' : 'false'} | priority: {topic.priority}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Research */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">
            Daily Research ({research?.length ?? 0})
          </h2>
          {researchError && (
            <pre className="bg-red-100 p-2 rounded text-sm mb-4">
              {JSON.stringify(researchError, null, 2)}
            </pre>
          )}
          <div className="space-y-2">
            {research?.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded border ${item.is_published ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}
              >
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-gray-500">
                  date: {item.research_date} | published: {item.is_published ? 'YES' : 'NO'} | topic_id: {item.topic_id?.slice(0, 8)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
