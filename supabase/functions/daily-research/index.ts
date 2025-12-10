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

interface ToolAnalysis {
  tool_name: string;
  tool_url: string | null;
  category: string;
  pricing: string;
  scores: {
    opportunity: number;
    problem_solved: number;
    feasibility: number;
    timing: number;
  };
  business_fit: {
    revenue_potential: string;
    execution_difficulty: number;
    go_to_market: number;
  };
  tags: string[];
  summary: string;
  content: string;
}

function parseToolAnalysis(content: string): Partial<ToolAnalysis> {
  // Try to extract JSON from the response
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      console.log('Failed to parse JSON block, using fallback extraction');
    }
  }

  // Fallback: extract scores from text using patterns
  const extractNumber = (pattern: RegExp, defaultVal: number): number => {
    const match = content.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      return num >= 1 && num <= 10 ? num : defaultVal;
    }
    return defaultVal;
  };

  return {
    scores: {
      opportunity: extractNumber(/opportunity[:\s]*(\d+)/i, 5),
      problem_solved: extractNumber(/problem[:\s]*(\d+)/i, 5),
      feasibility: extractNumber(/feasibility[:\s]*(\d+)/i, 5),
      timing: extractNumber(/timing[:\s]*(\d+)/i, 5),
    },
    business_fit: {
      revenue_potential: content.includes('$$$') ? '$$$' : content.includes('$$') ? '$$' : '$',
      execution_difficulty: extractNumber(/difficulty[:\s]*(\d+)/i, 5),
      go_to_market: extractNumber(/go.to.market[:\s]*(\d+)/i, 5),
    },
    tags: [],
  };
}

const SYSTEM_PROMPT = `You are an AI dev tool analyst for BreezyBuild, helping non-technical founders discover the best tools for building applications.

For each tool, provide a comprehensive analysis in the following JSON format (wrapped in \`\`\`json code blocks):

\`\`\`json
{
  "tool_name": "Name of the tool",
  "tool_url": "https://example.com",
  "category": "AI Code Editor",
  "pricing": "Free tier available, Pro $20/mo",
  "scores": {
    "opportunity": 8,
    "problem_solved": 9,
    "feasibility": 7,
    "timing": 9
  },
  "business_fit": {
    "revenue_potential": "$$",
    "execution_difficulty": 6,
    "go_to_market": 8
  },
  "tags": ["Code Editor", "AI Assistant", "VSCode Alternative"],
  "summary": "2-3 sentence summary of the tool",
  "content": "Full markdown article about the tool"
}
\`\`\`

**Scoring Criteria (1-10):**
- **Opportunity**: Market size and growth potential for tools in this category
- **Problem Solved**: How severe is the pain point for non-technical founders (10 = critical need)
- **Feasibility**: Ease of adoption and learning curve (10 = very easy to start using)
- **Timing**: Is now the right time to adopt this tool (10 = perfect timing)

**Business Fit:**
- **Revenue Potential**: $ = side project, $$ = $100K-$1M potential, $$$ = $1M+ potential
- **Execution Difficulty**: How hard to implement (1-10, 10 = very complex)
- **Go-to-Market**: Market opportunity score (1-10)

**Content Guidelines:**
- Focus on practical value for non-technical founders
- Include key features, pricing, and real use cases
- Be concise but comprehensive
- Use markdown formatting for the content field`;

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

        // Call Perplexity API with enhanced prompt
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-large-128k-online',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: `Research and analyze: ${topic.search_query}\n\nProvide the analysis in the JSON format specified.` }
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
        const rawContent = result.choices?.[0]?.message?.content || '';

        if (!rawContent) {
          console.error(`No content returned for ${topic.name}`);
          results.push({ topic: topic.name, success: false, error: 'No content returned' });
          continue;
        }

        // Parse the structured response
        const analysis = parseToolAnalysis(rawContent);

        // Extract content from JSON or use raw content
        const content = analysis.content || rawContent.replace(/```json[\s\S]*?```/g, '').trim();

        // Generate summary
        const summary = analysis.summary || content
          .slice(0, 250)
          .replace(/\n/g, ' ')
          .replace(/#{1,6}\s/g, '')
          .trim() + '...';

        // Store research result with new score fields
        const { error: insertError } = await supabase.from('daily_research').upsert({
          topic_id: topic.id,
          research_date: new Date().toISOString().split('T')[0],
          title: analysis.tool_name || `${topic.name} Updates`,
          summary,
          content,
          sources: result.citations || [],
          raw_perplexity: result,
          is_published: true,
          // New score fields
          opportunity_score: analysis.scores?.opportunity || 5,
          problem_score: analysis.scores?.problem_solved || 5,
          feasibility_score: analysis.scores?.feasibility || 5,
          timing_score: analysis.scores?.timing || 5,
          revenue_potential: analysis.business_fit?.revenue_potential || '$',
          execution_difficulty: analysis.business_fit?.execution_difficulty || 5,
          go_to_market_score: analysis.business_fit?.go_to_market || 5,
          tags: analysis.tags || [],
          tool_url: analysis.tool_url || null,
          tool_pricing: analysis.pricing || null,
          is_featured: false,
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
