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
// Pipeline Run Logger
// ============================================
async function createPipelineRun(runType: string) {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('pipeline_runs')
    .insert([{
      run_type: runType,
      status: 'started',
      started_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    console.error('[Post Pipeline] Error creating pipeline run:', error);
    return null;
  }

  return data;
}

async function updatePipelineRun(
  runId: string,
  status: 'completed' | 'failed' | 'skipped',
  updates: {
    contentGenerated?: boolean;
    errorType?: string;
    errorMessage?: string;
    topicProcessed?: string;
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
      topic_processed: updates.topicProcessed || null,
    })
    .eq('id', runId);

  if (error) {
    console.error('[Post Pipeline] Error updating pipeline run:', error);
  }
}

// ============================================
// Main Handler - Scheduled Daily at 7am UTC
// ============================================
export default async function handler(request: Request, context: Context) {
  console.log('[Post Pipeline] Starting daily post pipeline check...');
  console.log('[Post Pipeline] Time:', new Date().toISOString());

  const pipelineRun = await createPipelineRun('daily_post_check');

  try {
    const supabase = getSupabaseServiceClient();

    // Check if today's post already exists
    console.log('[Post Pipeline] Checking if today\'s post exists...');
    const { data: hasPost, error: checkError } = await supabase
      .rpc('has_todays_post');

    if (checkError) {
      console.error('[Post Pipeline] Error checking for today\'s post:', checkError);
      if (pipelineRun) {
        await updatePipelineRun(pipelineRun.id, 'failed', {
          errorType: 'check_error',
          errorMessage: checkError.message,
        });
      }
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to check for today\'s post' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (hasPost) {
      console.log('[Post Pipeline] Today\'s post already exists. Skipping generation.');
      if (pipelineRun) {
        await updatePipelineRun(pipelineRun.id, 'skipped', {
          contentGenerated: false,
        });
      }
      return new Response(
        JSON.stringify({ success: true, message: 'Today\'s post already exists', skipped: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Trigger background content generation
    console.log('[Post Pipeline] No post for today. Triggering content generation...');

    const siteUrl = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:8888';
    const generateUrl = `${siteUrl}/.netlify/functions/generate-post-content`;

    const response = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Pipeline-Secret': getEnvVar('PIPELINE_SECRET_KEY'),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Post Pipeline] Generation request failed:', errorText);
      if (pipelineRun) {
        await updatePipelineRun(pipelineRun.id, 'failed', {
          errorType: 'generation_trigger_failed',
          errorMessage: errorText,
        });
      }
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to trigger content generation' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('[Post Pipeline] Content generation triggered successfully:', result);

    if (pipelineRun) {
      await updatePipelineRun(pipelineRun.id, 'completed', {
        contentGenerated: true,
        topicProcessed: result.topic,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Post generation triggered',
        result,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Post Pipeline] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (pipelineRun) {
      await updatePipelineRun(pipelineRun.id, 'failed', {
        errorType: 'unexpected_error',
        errorMessage,
      });
    }

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ============================================
// Schedule Configuration - 7am UTC daily
// (1 hour after tool content at 6am)
// ============================================
export const config: Config = {
  schedule: '0 7 * * *',
};
