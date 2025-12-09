import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ResearchTopic {
  id: string;
  name: string;
  slug: string;
  search_query: string;
  is_active: boolean;
  priority: number;
}

interface PerplexityResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  citations?: string[];
}

Deno.serve(async (_req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get active topics ordered by priority
    const { data: topics, error: topicsError } = await supabase
      .from('research_topics')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (topicsError) {
      console.error('Error fetching topics:', topicsError);
      return new Response(JSON.stringify({ success: false, error: topicsError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const results: Array<{ topic: string; success: boolean; error?: string }> = [];

    for (const topic of (topics as ResearchTopic[]) || []) {
      try {
        console.log(`Researching: ${topic.name}`);

        // Call Perplexity API
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-large-128k-online',
            messages: [
              {
                role: 'system',
                content: `You research AI dev tool updates for non-technical founders learning vibe-coding.
Be concise, practical, focus on what matters for builders.
Format with clear sections using markdown headers.
Include specific features, pricing changes, and practical use cases.`
              },
              { role: 'user', content: topic.search_query }
            ],
            return_citations: true,
            search_recency_filter: 'week',
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Perplexity API error for ${topic.name}:`, errorText);
          results.push({ topic: topic.name, success: false, error: errorText });
          continue;
        }

        const result: PerplexityResponse = await response.json();
        const content = result.choices?.[0]?.message?.content || '';

        if (!content) {
          console.error(`No content returned for ${topic.name}`);
          results.push({ topic: topic.name, success: false, error: 'No content returned' });
          continue;
        }

        // Generate summary from first 250 chars
        const summary = content
          .slice(0, 250)
          .replace(/\n/g, ' ')
          .replace(/#{1,6}\s/g, '')
          .trim() + '...';

        // Store research result
        const { error: insertError } = await supabase.from('daily_research').upsert({
          topic_id: topic.id,
          research_date: new Date().toISOString().split('T')[0],
          title: `${topic.name} Updates`,
          summary,
          content,
          sources: result.citations || [],
          raw_perplexity: result,
          is_published: true,
        }, { onConflict: 'topic_id,research_date' });

        if (insertError) {
          console.error(`Error storing research for ${topic.name}:`, insertError);
          results.push({ topic: topic.name, success: false, error: insertError.message });
        } else {
          console.log(`Successfully researched: ${topic.name}`);
          results.push({ topic: topic.name, success: true });
        }

        // Rate limit: wait 1 second between API calls
        await new Promise(r => setTimeout(r, 1000));

      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error processing ${topic.name}:`, error);
        results.push({ topic: topic.name, success: false, error });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Completed: ${successCount}/${results.length} topics researched`);

    return new Response(JSON.stringify({
      success: true,
      message: `Researched ${successCount}/${results.length} topics`,
      results,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('Fatal error:', error);
    return new Response(JSON.stringify({ success: false, error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
