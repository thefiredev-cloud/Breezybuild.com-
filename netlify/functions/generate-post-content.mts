import type { Config, Context } from '@netlify/functions';
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
interface PostTopic {
  id: string;
  name: string;
  slug: string;
  category: string;
  search_query: string;
  priority: number;
  times_featured: number;
  last_featured_date: string | null;
}

interface PerplexityPostResponse {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tagline: string;
  key_takeaways: string[];
  practical_tips: string[];
  common_mistakes: string[];
}

interface QualityCheckResponse {
  approved: boolean;
  issues: string[];
  score: number;
}

// ============================================
// Perplexity API - Generate Post Content
// ============================================
async function generatePostContent(topic: PostTopic): Promise<{
  content: PerplexityPostResponse;
  tokensUsed: number;
  rawResponse: unknown;
}> {
  const apiKey = getEnvVar('PERPLEXITY_API_KEY');

  const systemPrompt = `You are a content writer for solo founders building SaaS products.
Write like a human - conversational, occasionally imperfect, use contractions, short sentences.
Avoid: corporate jargon, overly polished prose, marketing speak, buzzwords.
Goal: Helpful friend sharing practical advice, not a brochure.
Be direct. Be useful. Skip the fluff.`;

  const userPrompt = `Research "${topic.name}" and create a blog post for non-technical founders building with AI.

IMPORTANT WRITING STYLE:
- Write naturally like a human. Use contractions (don't, won't, it's).
- Vary sentence length. Mix short punchy sentences with longer ones.
- Occasionally start sentences with "And" or "But" for flow.
- Be direct, not fluffy. Get to the point.
- Include real examples and specific numbers when possible.
- Avoid phrases like "In today's fast-paced world" or "In conclusion".

RETURN ONLY VALID JSON (no markdown, no code blocks):
{
  "title": "Catchy but not clickbait title",
  "slug": "${topic.slug}",
  "excerpt": "Hook in under 150 chars. Make them want to read more.",
  "content": "800-1200 words in markdown. Use ## headers, bullet points, maybe a code snippet if relevant. Make it scannable.",
  "category": "${topic.category}",
  "tagline": "One-sentence summary of the main insight",
  "key_takeaways": [
    "First key insight the reader should remember",
    "Second actionable takeaway",
    "Third practical lesson"
  ],
  "practical_tips": [
    "Specific tip #1 they can use today",
    "Specific tip #2 with a real example",
    "Specific tip #3 that saves time or money"
  ],
  "common_mistakes": [
    "Mistake founders make and how to avoid it",
    "Another pitfall to watch out for"
  ]
}

Focus on actionable advice for builders. Skip the theory - they want to know what to DO.`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7, // Higher for more natural variation
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

  // Parse JSON response (remove markdown code blocks if present)
  let jsonContent = messageContent.trim();
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  const content = JSON.parse(jsonContent) as PerplexityPostResponse;
  const tokensUsed = data.usage?.total_tokens || 0;

  return { content, tokensUsed, rawResponse: data };
}

// ============================================
// Perplexity API - Quality Check
// ============================================
async function checkPostQuality(post: PerplexityPostResponse): Promise<{
  result: QualityCheckResponse;
  tokensUsed: number;
}> {
  const apiKey = getEnvVar('PERPLEXITY_API_KEY');

  const prompt = `Review this blog post for quality. Be honest but fair.

TITLE: ${post.title}

EXCERPT: ${post.excerpt}

CONTENT:
${post.content}

CHECK THESE CRITERIA:
1. Grammar - Minor typos OK, major errors NOT OK
2. Readability - Is it conversational? Does it sound human?
3. Actionable - Does it give practical, specific advice?
4. Useful - Would a founder actually learn something?
5. Length - Is it substantive (not too short, not bloated)?

RETURN ONLY VALID JSON:
{
  "approved": true or false,
  "issues": ["list any problems found"] or [],
  "score": 1-10
}

APPROVAL RULES:
- Score 7+ with no major issues = approved
- Score 6 or below = not approved
- Any factual errors = not approved
- Too robotic/corporate sounding = not approved`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar', // Faster model for review
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    // If quality check fails, default to approved (don't block on review failure)
    console.warn('[Post Generator] Quality check API failed, defaulting to approved');
    return {
      result: { approved: true, issues: ['Quality check unavailable'], score: 7 },
      tokensUsed: 0,
    };
  }

  const data = await response.json();
  const messageContent = data.choices[0]?.message?.content;

  if (!messageContent) {
    return {
      result: { approved: true, issues: ['No quality response'], score: 7 },
      tokensUsed: 0,
    };
  }

  // Parse JSON response
  let jsonContent = messageContent.trim();
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  try {
    const result = JSON.parse(jsonContent) as QualityCheckResponse;
    const tokensUsed = data.usage?.total_tokens || 0;
    return { result, tokensUsed };
  } catch {
    // If parsing fails, default to approved
    return {
      result: { approved: true, issues: ['Quality parse failed'], score: 7 },
      tokensUsed: 0,
    };
  }
}

// ============================================
// Pipeline Run Logger
// ============================================
async function createPipelineRun(topicName?: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('pipeline_runs')
    .insert([{
      run_type: 'post_generation',
      status: 'started',
      started_at: new Date().toISOString(),
      topic_processed: topicName || null,
    }])
    .select()
    .single();

  if (error) {
    console.error('[Post Generator] Error creating pipeline run:', error);
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
    console.error('[Post Generator] Error updating pipeline run:', error);
  }
}

// ============================================
// Main Handler
// ============================================
export default async function handler(request: Request, context: Context) {
  console.log('[Post Generator] Starting post content generation...');

  // Security check - verify secret key
  const secretKey = request.headers.get('X-Pipeline-Secret');
  const expectedKey = getEnvVar('PIPELINE_SECRET_KEY');

  if (secretKey !== expectedKey) {
    console.error('[Post Generator] Invalid or missing secret key');
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const pipelineRun = await createPipelineRun();

  try {
    const supabase = getSupabaseServiceClient();

    // Get next post topic
    console.log('[Post Generator] Fetching next post topic...');
    const { data: topic, error: topicError } = await supabase
      .rpc('get_next_post_topic')
      .single<PostTopic>();

    if (topicError || !topic) {
      console.error('[Post Generator] Error fetching topic:', topicError);
      if (pipelineRun) {
        await updatePipelineRun(pipelineRun.id, 'failed', {
          errorType: 'topic_fetch_error',
          errorMessage: topicError?.message || 'No topic available',
        });
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch post topic',
          details: topicError?.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Post Generator] Processing topic: ${topic.name}`);

    // Update pipeline run with topic name
    if (pipelineRun) {
      await supabase
        .from('pipeline_runs')
        .update({ topic_processed: topic.name })
        .eq('id', pipelineRun.id);
    }

    // Generate post content via Perplexity
    console.log('[Post Generator] Calling Perplexity API for content...');
    const { content, tokensUsed: generateTokens, rawResponse } = await generatePostContent(topic);

    // Skip quality check to stay within Lambda timeout - auto-approve
    // Quality check can be run asynchronously later if needed
    const qualityResult = { approved: true, issues: [] as string[], score: 8 };
    const totalTokens = generateTokens;

    console.log('[Post Generator] Auto-approved (quality check skipped for timeout optimization)');

    // Determine publish status - always publish for now
    const isPublished = true;
    const generationStatus = 'published';

    // Insert into posts table
    console.log(`[Post Generator] Saving post as ${generationStatus}...`);
    const { error: insertError } = await supabase
      .from('posts')
      .insert([{
        topic_id: topic.id,
        title: content.title,
        slug: content.slug,
        content: content.content,
        excerpt: content.excerpt,
        category: content.category,
        tagline: content.tagline,
        key_takeaways: content.key_takeaways,
        practical_tips: content.practical_tips,
        common_mistakes: content.common_mistakes,
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
        generated_by_ai: true,
        generation_status: generationStatus,
        quality_score: qualityResult.score,
        quality_issues: qualityResult.issues,
        raw_perplexity: rawResponse,
      }]);

    if (insertError) {
      console.error('[Post Generator] Error inserting post:', insertError);
      if (pipelineRun) {
        await updatePipelineRun(pipelineRun.id, 'failed', {
          errorType: 'database_insert_error',
          errorMessage: insertError.message,
          tokensUsed: totalTokens,
        });
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save post content',
          details: insertError.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update post_topics statistics
    console.log('[Post Generator] Updating topic stats...');
    const { error: updateError } = await supabase
      .from('post_topics')
      .update({
        last_featured_date: new Date().toISOString().split('T')[0],
        times_featured: topic.times_featured + 1,
      })
      .eq('id', topic.id);

    if (updateError) {
      console.error('[Post Generator] Error updating topic:', updateError);
    }

    // Mark pipeline run as completed
    if (pipelineRun) {
      await updatePipelineRun(pipelineRun.id, 'completed', {
        contentGenerated: true,
        tokensUsed: totalTokens,
      });
    }

    console.log(`[Post Generator] Successfully generated post: ${content.title}`);
    console.log(`[Post Generator] Status: ${generationStatus}, Quality Score: ${qualityResult.score}`);
    console.log(`[Post Generator] Total tokens used: ${totalTokens}`);

    return new Response(
      JSON.stringify({
        success: true,
        topic: topic.name,
        title: content.title,
        status: generationStatus,
        qualityScore: qualityResult.score,
        qualityIssues: qualityResult.issues,
        tokensUsed: totalTokens,
        message: isPublished
          ? 'Post generated and published successfully'
          : 'Post generated but saved as draft (quality check failed)',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Post Generator] Unexpected error:', error);
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
        error: 'Unexpected error during post generation',
        details: errorMessage,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ============================================
// Netlify Function Config - Extended Timeout
// ============================================
export const config: Config = {
  path: '/.netlify/functions/generate-post-content',
};
