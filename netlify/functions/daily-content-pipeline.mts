import type { Config } from '@netlify/functions';
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
async function logPipelineRun(
  status: 'started' | 'completed' | 'failed' | 'skipped',
  errorMessage?: string
) {
  const supabase = getSupabaseServiceClient();

  const pipelineRun = {
    run_type: 'daily_scheduled',
    status,
    started_at: new Date().toISOString(),
    completed_at: status !== 'started' ? new Date().toISOString() : null,
    error_message: errorMessage || null,
  };

  const { error } = await supabase
    .from('pipeline_runs')
    .insert([pipelineRun]);

  if (error) {
    console.error('Error logging pipeline run:', error);
  }
}

// ============================================
// Main Handler
// ============================================
export default async function handler() {
  console.log('[Daily Pipeline] Starting daily content pipeline check...');

  try {
    const supabase = getSupabaseServiceClient();

    // Check if today's content already exists
    const { data: hasContent, error: checkError } = await supabase
      .rpc('has_todays_research');

    if (checkError) {
      console.error('[Daily Pipeline] Error checking today\'s content:', checkError);
      await logPipelineRun('failed', `Failed to check today's content: ${checkError.message}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to check today\'s content',
          details: checkError.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If content already exists, skip generation
    if (hasContent) {
      console.log('[Daily Pipeline] Today\'s content already exists. Skipping generation.');
      await logPipelineRun('skipped', 'Content already exists for today');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Content already exists for today',
          skipped: true
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Trigger background content generation
    console.log('[Daily Pipeline] Triggering background content generation...');
    await logPipelineRun('started');

    // Invoke the background function
    const generateUrl = `${process.env.URL || 'https://breezybuild.com'}/.netlify/functions/generate-tool-content`;
    const secretKey = getEnvVar('PIPELINE_SECRET_KEY');

    const response = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Pipeline-Secret': secretKey,
      },
      body: JSON.stringify({ trigger: 'daily_scheduled' }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Daily Pipeline] Failed to trigger generator:', errorText);
      await logPipelineRun('failed', `Failed to trigger generator: ${errorText}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to trigger content generator',
          details: errorText
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Daily Pipeline] Successfully triggered background generation');
    await logPipelineRun('completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Content generation triggered successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Daily Pipeline] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logPipelineRun('failed', errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unexpected error in pipeline',
        details: errorMessage
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ============================================
// Netlify Scheduled Function Config
// ============================================
export const config: Config = {
  schedule: '0 6 * * *', // Run daily at 6:00 AM UTC
};
