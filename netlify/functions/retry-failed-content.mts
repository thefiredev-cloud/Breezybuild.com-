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
async function logRetryAttempt(
  originalRunId: string,
  status: 'started' | 'completed' | 'failed',
  errorMessage?: string
) {
  const supabase = getSupabaseServiceClient();

  const retryRun = {
    run_type: 'retry_attempt',
    status,
    started_at: new Date().toISOString(),
    completed_at: status !== 'started' ? new Date().toISOString() : null,
    error_message: errorMessage || null,
  };

  const { error } = await supabase
    .from('pipeline_runs')
    .insert([retryRun]);

  if (error) {
    console.error('Error logging retry attempt:', error);
  }
}

// ============================================
// Get Failed Pipeline Runs
// ============================================
async function getFailedPipelineRuns() {
  const supabase = getSupabaseServiceClient();

  // Get failed runs from the last 24 hours that have been retried less than 3 times
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const { data, error } = await supabase
    .from('pipeline_runs')
    .select('*')
    .eq('status', 'failed')
    .gte('started_at', twentyFourHoursAgo.toISOString())
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error fetching failed pipeline runs:', error);
    return [];
  }

  // Filter runs that have been retried less than 3 times
  // We'll count retries by checking how many retry attempts exist for each original run
  const runsWithRetryCounts = await Promise.all(
    (data || []).map(async (run) => {
      const { count } = await supabase
        .from('pipeline_runs')
        .select('*', { count: 'exact', head: true })
        .eq('run_type', 'retry_attempt')
        .gte('started_at', run.started_at);

      return {
        ...run,
        retryCount: count || 0,
      };
    })
  );

  // Return only runs that have been retried less than 3 times
  return runsWithRetryCounts.filter(run => run.retryCount < 3);
}

// ============================================
// Trigger Content Generation
// ============================================
async function triggerContentGeneration() {
  const generateUrl = `${process.env.URL || 'https://breezybuild.com'}/.netlify/functions/generate-tool-content`;
  const secretKey = getEnvVar('PIPELINE_SECRET_KEY');

  const response = await fetch(generateUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Pipeline-Secret': secretKey,
    },
    body: JSON.stringify({ trigger: 'retry_attempt' }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to trigger generator: ${errorText}`);
  }

  return await response.json();
}

// ============================================
// Main Handler
// ============================================
export default async function handler() {
  console.log('[Retry Pipeline] Starting retry check for failed pipeline runs...');

  try {
    const supabase = getSupabaseServiceClient();

    // Check if today's content already exists
    const { data: hasContent, error: checkError } = await supabase
      .rpc('has_todays_research');

    if (checkError) {
      console.error('[Retry Pipeline] Error checking today\'s content:', checkError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to check today\'s content',
          details: checkError.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If content already exists, skip retry
    if (hasContent) {
      console.log('[Retry Pipeline] Today\'s content already exists. No retry needed.');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Content already exists for today',
          skipped: true
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get failed pipeline runs from the last 24 hours
    console.log('[Retry Pipeline] Fetching failed pipeline runs...');
    const failedRuns = await getFailedPipelineRuns();

    if (failedRuns.length === 0) {
      console.log('[Retry Pipeline] No failed runs to retry');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No failed runs to retry',
          retriedCount: 0
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Retry Pipeline] Found ${failedRuns.length} failed run(s) to retry`);

    // Get the most recent failed run
    const runToRetry = failedRuns[0];
    console.log(`[Retry Pipeline] Retrying run from ${runToRetry.started_at}`);
    console.log(`[Retry Pipeline] Original error: ${runToRetry.error_message}`);
    console.log(`[Retry Pipeline] Retry count: ${runToRetry.retryCount}/3`);

    await logRetryAttempt(runToRetry.id, 'started');

    try {
      // Trigger content generation
      const result = await triggerContentGeneration();

      console.log('[Retry Pipeline] Retry successful:', result);
      await logRetryAttempt(runToRetry.id, 'completed');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Successfully retried failed pipeline run',
          retriedRun: {
            id: runToRetry.id,
            originalError: runToRetry.error_message,
            retryCount: runToRetry.retryCount + 1,
          },
          result
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (retryError) {
      const errorMessage = retryError instanceof Error ? retryError.message : 'Unknown error';
      console.error('[Retry Pipeline] Retry failed:', errorMessage);
      await logRetryAttempt(runToRetry.id, 'failed', errorMessage);

      // Check if we've reached the max retry count
      if (runToRetry.retryCount >= 2) {
        console.error(`[Retry Pipeline] Max retries (3) reached for run ${runToRetry.id}`);
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Retry attempt failed',
          details: errorMessage,
          retriedRun: {
            id: runToRetry.id,
            originalError: runToRetry.error_message,
            retryCount: runToRetry.retryCount + 1,
            maxRetriesReached: runToRetry.retryCount >= 2,
          }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('[Retry Pipeline] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unexpected error in retry pipeline',
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
  schedule: '0 */4 * * *', // Run every 4 hours
};
