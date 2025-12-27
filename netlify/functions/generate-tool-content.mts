import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// ============================================
// Environment Variables
// ============================================
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// ============================================
// Supabase Client
// ============================================
function getSupabaseServiceClient() {
  return createClient(
    getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// ============================================
// Type Definitions
// ============================================
interface UseCase {
  title: string;
  description: string;
}

interface QuickStartStep {
  step: number;
  title: string;
  description: string;
}

interface PricingTier {
  name: string;
  price: string;
  features: string[];
}

interface PerplexityToolResponse {
  tagline: string;
  what_it_is: string;
  why_it_matters: string;
  use_cases: UseCase[];
  quick_start_guide: QuickStartStep[];
  pro_tips: string[];
  gotchas: string[];
  scores: {
    learning_curve: number;
    ecosystem: number;
    maturity: number;
    cost_value: number;
  };
  community: {
    size: string;
    sentiment: string;
    notable_users: string[];
  };
  pricing: {
    model: string;
    tiers: PricingTier[];
  };
  links: {
    official: string;
    docs: string;
    github: string;
  };
}

interface ResearchTopic {
  id: string;
  name: string;
  slug: string;
  category: string;
  search_query: string;
  priority: number;
  times_featured: number;
  last_featured_date: string | null;
}

// ============================================
// Perplexity API Call
// ============================================
async function callPerplexityAPI(toolName: string, searchQuery: string): Promise<{
  content: PerplexityToolResponse;
  tokensUsed: number;
  rawResponse: any;
}> {
  const apiKey = getEnvVar('PERPLEXITY_API_KEY');

  const prompt = `You are a technical content researcher for solo founders building SaaS products and hardware/robotics projects. Research the tool "${toolName}" and provide a comprehensive, factual breakdown in JSON format.

WRITING STYLE RULES:
- NEVER use em-dashes (—). Use commas, periods, or restructure sentences instead.
- Write in a natural, human tone. Avoid overly formal or robotic phrasing.
- Keep sentences punchy and direct.

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations - just the JSON object.

Required JSON structure:
{
  "tagline": "One-sentence description of what this tool does",
  "what_it_is": "Plain English explanation (2-3 paragraphs, no jargon) of what this tool is and how it works",
  "why_it_matters": "Why solo founders should care about this tool - focus on practical benefits for building products",
  "use_cases": [
    {
      "title": "Use case title",
      "description": "How this applies to building SaaS or hardware/robotics projects"
    }
  ],
  "quick_start_guide": [
    {
      "step": 1,
      "title": "Step title",
      "description": "What to do in this step"
    }
  ],
  "pro_tips": [
    "Expert tip #1 for using this tool effectively",
    "Expert tip #2",
    "Expert tip #3"
  ],
  "gotchas": [
    "Common pitfall or challenge #1",
    "Common pitfall or challenge #2"
  ],
  "scores": {
    "learning_curve": 3,
    "ecosystem": 4,
    "maturity": 5,
    "cost_value": 4
  },
  "community": {
    "size": "Small/Medium/Large/Very Large",
    "sentiment": "Growing/Stable/Declining",
    "notable_users": ["Company 1", "Company 2"]
  },
  "pricing": {
    "model": "Free/Freemium/Paid/Enterprise",
    "tiers": [
      {
        "name": "Free",
        "price": "$0/month",
        "features": ["Feature 1", "Feature 2"]
      }
    ]
  },
  "links": {
    "official": "https://...",
    "docs": "https://...",
    "github": "https://github.com/..."
  }
}

Scoring guide (1-5 scale):
- learning_curve: 1=Very steep, 5=Very easy
- ecosystem: 1=Limited, 5=Rich ecosystem
- maturity: 1=Experimental, 5=Production-ready
- cost_value: 1=Expensive, 5=Great value

Make the quick_start_guide concise (4 steps max). Focus on actionable, practical information for builders.`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are a technical research assistant. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const messageContent = data.choices[0]?.message?.content;

  if (!messageContent) {
    throw new Error('No content in Perplexity API response');
  }

  // Parse the JSON response (remove markdown code blocks if present)
  let jsonContent = messageContent.trim();
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  const content = JSON.parse(jsonContent) as PerplexityToolResponse;
  const tokensUsed = data.usage?.total_tokens || 0;

  return { content, tokensUsed, rawResponse: data };
}

// ============================================
// Pipeline Run Logger
// ============================================
async function createPipelineRun(topicName?: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('pipeline_runs')
    .insert([{
      run_type: 'background_generation',
      status: 'started',
      started_at: new Date().toISOString(),
      topic_processed: topicName || null,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating pipeline run:', error);
    return null;
  }

  return data;
}

async function updatePipelineRun(
  runId: string,
  status: 'completed' | 'failed',
  updates: {
    contentGenerated?: boolean;
    errorType?: string;
    errorMessage?: string;
    tokensUsed?: number;
  }
) {
  const supabase = getSupabaseServiceClient();

  const { error } = await supabase
    .from('pipeline_runs')
    .update({
      status,
      completed_at: new Date().toISOString(),
      content_generated: updates.contentGenerated || false,
      error_type: updates.errorType || null,
      error_message: updates.errorMessage || null,
      perplexity_tokens_used: updates.tokensUsed || null,
    })
    .eq('id', runId);

  if (error) {
    console.error('Error updating pipeline run:', error);
  }
}

// ============================================
// Main Handler
// ============================================
export default async function handler(request: Request, context: Context) {
  console.log('[Content Generator] Starting background content generation...');

  // Security check - verify secret key
  const secretKey = request.headers.get('X-Pipeline-Secret');
  const expectedKey = getEnvVar('PIPELINE_SECRET_KEY');

  if (secretKey !== expectedKey) {
    console.error('[Content Generator] Invalid or missing secret key');
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const pipelineRun = await createPipelineRun();

  try {
    const supabase = getSupabaseServiceClient();

    // Get next research topic
    console.log('[Content Generator] Fetching next research topic...');
    const { data: topic, error: topicError } = await supabase
      .rpc('get_next_research_topic')
      .single<ResearchTopic>();

    if (topicError || !topic) {
      console.error('[Content Generator] Error fetching topic:', topicError);
      if (pipelineRun) {
        await updatePipelineRun(pipelineRun.id, 'failed', {
          errorType: 'topic_fetch_error',
          errorMessage: topicError?.message || 'No topic available',
        });
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch research topic',
          details: topicError?.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Content Generator] Processing topic: ${topic.name}`);

    // Update pipeline run with topic name
    if (pipelineRun) {
      await supabase
        .from('pipeline_runs')
        .update({ topic_processed: topic.name })
        .eq('id', pipelineRun.id);
    }

    // Call Perplexity API
    console.log('[Content Generator] Calling Perplexity API...');
    const { content, tokensUsed, rawResponse } = await callPerplexityAPI(
      topic.name,
      topic.search_query
    );

    // Insert into daily_research
    console.log('[Content Generator] Saving research content...');
    const { error: insertError } = await supabase
      .from('daily_research')
      .insert([{
        topic_id: topic.id,
        research_date: new Date().toISOString().split('T')[0],
        title: topic.name,
        summary: content.tagline,
        content: content.what_it_is,

        // Structured content
        tagline: content.tagline,
        what_it_is: content.what_it_is,
        why_it_matters: content.why_it_matters,
        use_cases: content.use_cases,
        quick_start_guide: content.quick_start_guide,
        pro_tips: content.pro_tips,
        gotchas: content.gotchas,

        // Scores
        score_learning_curve: content.scores.learning_curve,
        score_ecosystem: content.scores.ecosystem,
        score_maturity: content.scores.maturity,
        score_cost_value: content.scores.cost_value,

        // Community
        community_size: content.community.size,
        community_sentiment: content.community.sentiment,
        notable_users: content.community.notable_users,

        // Pricing
        pricing_model: content.pricing.model,
        pricing_tiers: content.pricing.tiers,

        // Links
        official_url: content.links.official,
        documentation_url: content.links.docs,
        github_url: content.links.github,

        // Metadata
        category: topic.category,
        pipeline_status: 'ready',
        raw_perplexity: rawResponse,
      }]);

    if (insertError) {
      console.error('[Content Generator] Error inserting research:', insertError);
      if (pipelineRun) {
        await updatePipelineRun(pipelineRun.id, 'failed', {
          errorType: 'database_insert_error',
          errorMessage: insertError.message,
          tokensUsed,
        });
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save research content',
          details: insertError.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update research_topics
    console.log('[Content Generator] Updating research topic stats...');
    const { error: updateError } = await supabase
      .from('research_topics')
      .update({
        last_featured_date: new Date().toISOString().split('T')[0],
        times_featured: topic.times_featured + 1,
      })
      .eq('id', topic.id);

    if (updateError) {
      console.error('[Content Generator] Error updating topic:', updateError);
    }

    // Mark pipeline run as completed
    if (pipelineRun) {
      await updatePipelineRun(pipelineRun.id, 'completed', {
        contentGenerated: true,
        tokensUsed,
      });
    }

    console.log(`[Content Generator] Successfully generated content for: ${topic.name}`);
    console.log(`[Content Generator] Tokens used: ${tokensUsed}`);

    return new Response(
      JSON.stringify({
        success: true,
        topic: topic.name,
        tokensUsed,
        message: 'Content generated successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Content Generator] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (pipelineRun) {
      await updatePipelineRun(pipelineRun.id, 'failed', {
        errorType: 'unexpected_error',
        errorMessage,
      });
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unexpected error during content generation',
        details: errorMessage
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
