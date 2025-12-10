import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Re-export types for convenience
export type { ToolContent, ToolCategory, ScoreValues } from '../types/tool-content';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for public operations (respects RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations requiring elevated privileges
// IMPORTANT: Only use this server-side, never expose to client
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Validate admin client has service role key
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set - admin operations will fail');
}

// Types for filtering
import type { ToolContent, ToolCategory } from '../types/tool-content';

interface GetToolsFilteredOptions {
  limit?: number;
  offset?: number;
  category?: ToolCategory;
  search?: string;
  minLearningCurve?: number;
}

interface GetToolsFilteredResult {
  tools: ToolContent[];
  total: number;
}

/**
 * Fetch tools from daily_research with optional filters
 */
export async function getToolsFiltered(
  options: GetToolsFilteredOptions = {}
): Promise<GetToolsFilteredResult> {
  const { limit = 20, offset = 0, category, search, minLearningCurve } = options;

  let query = supabase
    .from('daily_research')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('research_date', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,tagline.ilike.%${search}%`);
  }

  if (minLearningCurve && minLearningCurve > 0) {
    query = query.gte('score_learning_curve', minLearningCurve);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching tools:', error);
    throw error;
  }

  return {
    tools: (data as unknown as ToolContent[]) || [],
    total: count || 0,
  };
}

/**
 * Get today's published tool
 */
export async function getTodaysTool(): Promise<ToolContent | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_research')
    .select('*')
    .eq('is_published', true)
    .eq('research_date', today)
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as ToolContent;
}

/**
 * Get the most recent published tool
 */
export async function getLatestTool(): Promise<ToolContent | null> {
  const { data, error } = await supabase
    .from('daily_research')
    .select('*')
    .eq('is_published', true)
    .order('research_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as ToolContent;
}

/**
 * Get tool by specific date
 */
export async function getToolByDate(date: string): Promise<ToolContent | null> {
  const { data, error } = await supabase
    .from('daily_research')
    .select('*')
    .eq('is_published', true)
    .eq('research_date', date)
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as ToolContent;
}

/**
 * Get adjacent tools for navigation (previous and next)
 */
export async function getAdjacentTools(currentDate: string): Promise<{
  previous: ToolContent | null;
  next: ToolContent | null;
}> {
  // Get previous tool
  const { data: prevData } = await supabase
    .from('daily_research')
    .select('*')
    .eq('is_published', true)
    .lt('research_date', currentDate)
    .order('research_date', { ascending: false })
    .limit(1)
    .single();

  // Get next tool (up to today)
  const today = new Date().toISOString().split('T')[0];
  const { data: nextData } = await supabase
    .from('daily_research')
    .select('*')
    .eq('is_published', true)
    .gt('research_date', currentDate)
    .lte('research_date', today)
    .order('research_date', { ascending: true })
    .limit(1)
    .single();

  return {
    previous: prevData ? (prevData as unknown as ToolContent) : null,
    next: nextData ? (nextData as unknown as ToolContent) : null,
  };
}
