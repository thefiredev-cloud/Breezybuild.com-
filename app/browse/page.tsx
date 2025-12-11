import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BrowsePage() {
  try {
    const supabase = await createClient();

    // Test 1: Just create client
    const clientTest = supabase ? 'Client created' : 'Client failed';

    // Test 2: Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const userTest = userError ? `User error: ${userError.message}` : (user ? 'User found' : 'No user (anonymous)');

    // Test 3: Simple query without join
    const { data: simpleData, error: simpleError } = await supabase
      .from('daily_research')
      .select('id, title, research_date')
      .eq('is_published', true)
      .limit(3);
    const simpleTest = simpleError ? `Simple query error: ${simpleError.message}` : `Simple query: ${simpleData?.length} items`;

    // Test 4: Query with join
    const { data: joinData, error: joinError } = await supabase
      .from('daily_research')
      .select(`
        id,
        title,
        research_date,
        topic:research_topics(name, slug)
      `)
      .eq('is_published', true)
      .limit(3);
    const joinTest = joinError ? `Join query error: ${joinError.message}` : `Join query: ${joinData?.length} items`;

    return (
      <div className="min-h-screen bg-white p-8">
        <h1 className="text-3xl font-bold mb-8">Browse Page Debug</h1>
        <div className="space-y-4 font-mono text-sm">
          <p className="p-2 bg-gray-100 rounded">1. {clientTest}</p>
          <p className="p-2 bg-gray-100 rounded">2. {userTest}</p>
          <p className="p-2 bg-gray-100 rounded">3. {simpleTest}</p>
          <p className="p-2 bg-gray-100 rounded">4. {joinTest}</p>
          <div className="mt-8 p-4 bg-blue-50 rounded">
            <h2 className="font-bold mb-2">Join Query Data:</h2>
            <pre className="text-xs overflow-auto">{JSON.stringify(joinData, null, 2)}</pre>
          </div>
        </div>
        <p className="text-gray-400 mt-8">Timestamp: {new Date().toISOString()}</p>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Caught Error</h1>
        <pre className="bg-red-100 p-4 rounded text-sm overflow-auto">
          {error instanceof Error ? error.stack : JSON.stringify(error)}
        </pre>
      </div>
    );
  }
}
