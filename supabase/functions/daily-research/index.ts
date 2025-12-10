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
  last_featured_date: string | null;
  times_featured: number;
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
  perceived_value: {
    willingness_to_pay: number;
    market_validation: number;
    competitive_advantage: number;
    founder_appeal: number;
  };
  business_fit: {
    revenue_potential: string;
    execution_difficulty: number;
    go_to_market: number;
  };
  tags: string[];
  summary: string;
  content: string;
  key_features: string[];
  use_cases: string[];
  alternatives: string[];
  verdict: string;
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
    perceived_value: {
      willingness_to_pay: extractNumber(/willingness[:\s]*(\d+)/i, 5),
      market_validation: extractNumber(/validation[:\s]*(\d+)/i, 5),
      competitive_advantage: extractNumber(/advantage[:\s]*(\d+)/i, 5),
      founder_appeal: extractNumber(/appeal[:\s]*(\d+)/i, 5),
    },
    business_fit: {
      revenue_potential: content.includes('$$$') ? '$$$' : content.includes('$$') ? '$$' : '$',
      execution_difficulty: extractNumber(/difficulty[:\s]*(\d+)/i, 5),
      go_to_market: extractNumber(/go.to.market[:\s]*(\d+)/i, 5),
    },
    tags: [],
  };
}

const SYSTEM_PROMPT = `You are an elite AI dev tool analyst for BreezyBuild, helping non-technical founders discover the BEST tools for building applications without code.

For the tool provided, create a COMPREHENSIVE analysis in this exact JSON format (wrapped in \`\`\`json code blocks):

\`\`\`json
{
  "tool_name": "Official Name of the Tool",
  "tool_url": "https://official-website.com",
  "category": "Primary Category (e.g., AI Code Editor, No-Code Builder, Backend Service)",
  "pricing": "Detailed pricing: Free tier details, paid plans with exact prices",
  "scores": {
    "opportunity": 8,
    "problem_solved": 9,
    "feasibility": 7,
    "timing": 9
  },
  "perceived_value": {
    "willingness_to_pay": 8,
    "market_validation": 9,
    "competitive_advantage": 7,
    "founder_appeal": 9
  },
  "business_fit": {
    "revenue_potential": "$$",
    "execution_difficulty": 6,
    "go_to_market": 8
  },
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "key_features": [
    "Feature 1 with brief explanation",
    "Feature 2 with brief explanation",
    "Feature 3 with brief explanation"
  ],
  "use_cases": [
    "Use case 1: Specific scenario",
    "Use case 2: Specific scenario",
    "Use case 3: Specific scenario"
  ],
  "alternatives": ["Alternative Tool 1", "Alternative Tool 2"],
  "summary": "2-3 sentence compelling summary focused on value for non-technical founders",
  "content": "Full markdown article (800-1200 words) covering: Overview, Key Features, Pricing Breakdown, Real Use Cases, Pros & Cons, Getting Started Guide, Verdict",
  "verdict": "One-line verdict: Who should use this and why"
}
\`\`\`

**SCORING CRITERIA (1-10):**

Core Scores:
- **Opportunity (1-10)**: Market size × growth rate. 10 = massive growing market
- **Problem Solved (1-10)**: Pain severity for non-technical founders. 10 = critical daily pain
- **Feasibility (1-10)**: Ease of adoption. 10 = start building in minutes, no learning curve
- **Timing (1-10)**: Market timing. 10 = perfect time, strong momentum, recent major updates

Perceived Value (IMPORTANT - predict if founders will PAY):
- **Willingness to Pay (1-10)**: Would founders pay for this? 10 = "shut up and take my money"
- **Market Validation (1-10)**: Evidence of paying customers. 10 = strong revenue, testimonials, case studies
- **Competitive Advantage (1-10)**: How differentiated? 10 = unique, no real alternatives
- **Founder Appeal (1-10)**: Emotional resonance with founders. 10 = "this was made for me"

**Business Fit:**
- **Revenue Potential**: $ = hobby, $$ = $100K-$1M, $$$ = $1M+
- **Execution Difficulty (1-10)**: Implementation complexity. 1 = trivial, 10 = needs developer
- **Go-to-Market (1-10)**: Market opportunity. 10 = easy to reach customers

**CONTENT REQUIREMENTS:**
- Write for NON-TECHNICAL founders who want to build without coding
- Include SPECIFIC pricing (research current prices)
- Give REAL examples and use cases
- Be honest about limitations
- The content field should be comprehensive markdown (800-1200 words)
- Include a clear "Getting Started" section with step-by-step instructions`;

Deno.serve(async (_req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const today = new Date().toISOString().split('T')[0];

    // Check if we already have research for today
    const { data: existingResearch } = await supabase
      .from('daily_research')
      .select('id')
      .eq('research_date', today)
      .limit(1);

    if (existingResearch && existingResearch.length > 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Research already exists for today',
        skipped: true,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the NEXT tool to feature (rotation logic)
    // Priority: 1) Never featured tools (by priority), 2) Least recently featured (by priority)
    const { data: topics, error: topicsError } = await supabase
      .from('research_topics')
      .select('*')
      .eq('is_active', true)
      .order('last_featured_date', { ascending: true, nullsFirst: true })
      .order('priority', { ascending: false })
      .limit(1);

    if (topicsError || !topics || topics.length === 0) {
      console.error('Error fetching topic:', topicsError);
      return new Response(JSON.stringify({
        success: false,
        error: topicsError?.message || 'No active topics found'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const topic = topics[0] as ResearchTopic;
    console.log(`Tool of the Day: ${topic.name}`);

    // Call Perplexity API with enhanced prompt
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Research and analyze this AI dev tool for non-technical founders: ${topic.name}

Search query for context: ${topic.search_query}

Provide the COMPLETE analysis in the JSON format specified. Be thorough and specific.`
          }
        ],
        return_citations: true,
        search_recency_filter: 'week',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error:`, errorText);
      return new Response(JSON.stringify({
        success: false,
        error: `Perplexity API error: ${errorText}`
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result: PerplexityResponse = await response.json();
    const rawContent = result.choices?.[0]?.message?.content || '';

    if (!rawContent) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No content returned from Perplexity'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse the structured response
    const analysis = parseToolAnalysis(rawContent);

    // Extract content from JSON or use raw content
    const content = analysis.content || rawContent.replace(/```json[\s\S]*?```/g, '').trim();

    // Generate summary
    const summary = analysis.summary || content
      .slice(0, 300)
      .replace(/\n/g, ' ')
      .replace(/#{1,6}\s/g, '')
      .trim() + '...';

    // Calculate composite scores for perceived value
    const perceivedValue = analysis.perceived_value || {
      willingness_to_pay: 5,
      market_validation: 5,
      competitive_advantage: 5,
      founder_appeal: 5,
    };

    // Composite "Would Pay" score (weighted average)
    const wouldPayScore = Math.round(
      (perceivedValue.willingness_to_pay * 0.35) +
      (perceivedValue.market_validation * 0.25) +
      (perceivedValue.competitive_advantage * 0.20) +
      (perceivedValue.founder_appeal * 0.20)
    );

    // Store research result
    const { error: insertError } = await supabase.from('daily_research').insert({
      topic_id: topic.id,
      research_date: today,
      title: analysis.tool_name || topic.name,
      summary,
      content,
      sources: result.citations || [],
      raw_perplexity: result,
      is_published: true,
      // Core scores
      opportunity_score: analysis.scores?.opportunity || 5,
      problem_score: analysis.scores?.problem_solved || 5,
      feasibility_score: analysis.scores?.feasibility || 5,
      timing_score: analysis.scores?.timing || 5,
      // Business fit
      revenue_potential: analysis.business_fit?.revenue_potential || '$',
      execution_difficulty: analysis.business_fit?.execution_difficulty || 5,
      go_to_market_score: analysis.business_fit?.go_to_market || 5,
      // Metadata
      tags: analysis.tags || [],
      tool_url: analysis.tool_url || null,
      tool_pricing: analysis.pricing || null,
      is_featured: true,
    });

    if (insertError) {
      console.error('Error storing research:', insertError);
      return new Response(JSON.stringify({
        success: false,
        error: insertError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update topic rotation tracking
    await supabase
      .from('research_topics')
      .update({
        last_featured_date: today,
        times_featured: (topic.times_featured || 0) + 1,
      })
      .eq('id', topic.id);

    console.log(`Successfully researched: ${topic.name}`);

    return new Response(JSON.stringify({
      success: true,
      tool_of_the_day: analysis.tool_name || topic.name,
      date: today,
      scores: {
        opportunity: analysis.scores?.opportunity || 5,
        problem: analysis.scores?.problem_solved || 5,
        feasibility: analysis.scores?.feasibility || 5,
        timing: analysis.scores?.timing || 5,
        would_pay: wouldPayScore,
      },
      perceived_value: perceivedValue,
      next_in_rotation: null, // Could query next tool here
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
