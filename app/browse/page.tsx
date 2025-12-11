import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

type ResearchRow = {
  id: string;
  title: string;
  summary: string | null;
  research_date: string;
  topic: {
    name: string;
    slug: string;
  } | null;
};

export default async function BrowsePage() {
  const supabase = await createClient();

  // Get all published research with topic join
  const { data: research, error } = await supabase
    .from('daily_research')
    .select(`
      id,
      title,
      summary,
      research_date,
      topic:research_topics(name, slug)
    `)
    .eq('is_published', true)
    .order('research_date', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Database Error</h1>
          <pre className="bg-red-100 p-4 rounded text-sm">{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    );
  }

  const typedResearch = (research as ResearchRow[]) ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="border-b p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-orange-500">BreezyBuild</Link>
          <nav className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Browse AI Dev Tools</h1>
        <p className="text-center text-gray-600 mb-12">
          Today&apos;s Tool is free. Upgrade to unlock the full archive.
        </p>

        {typedResearch.length > 0 ? (
          <div className="space-y-4">
            {typedResearch
              .filter((item) => item.topic !== null)
              .map((item) => {
                const formattedDate = new Date(item.research_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={item.id}
                    className="p-6 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                        {item.topic?.name ?? 'Uncategorized'}
                      </span>
                      <span className="text-sm text-gray-500">{formattedDate}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                    {item.summary && (
                      <p className="text-gray-600 mt-2 line-clamp-2">{item.summary}</p>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-center text-gray-500">No research available yet.</p>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <p className="text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} BreezyBuild
        </p>
      </footer>
    </div>
  );
}
