import { createClient } from '@/utils/supabase/server';
import type { LlmUpdate, LlmUpdateInsert } from '@/types/database.types';

export type LlmUpdateFilters = {
  tool_name?: string;
  update_type?: string;
  converted_to_tutorial?: boolean;
  limit?: number;
  offset?: number;
};

/**
 * Fetches LLM updates with optional filters and pagination
 */
export async function getLlmUpdates(filters: LlmUpdateFilters = {}): Promise<{
  data: LlmUpdate[];
  count: number;
  error: Error | null;
}> {
  const supabase = await createClient();
  const { tool_name, update_type, converted_to_tutorial, limit = 20, offset = 0 } = filters;

  let query = supabase
    .from('llm_updates')
    .select('*', { count: 'exact' })
    .order('detected_at', { ascending: false });

  if (tool_name) {
    query = query.ilike('tool_name', `%${tool_name}%`);
  }

  if (update_type) {
    query = query.eq('update_type', update_type);
  }

  if (typeof converted_to_tutorial === 'boolean') {
    query = query.eq('converted_to_tutorial', converted_to_tutorial);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  return {
    data: (data as LlmUpdate[]) || [],
    count: count || 0,
    error: error ? new Error(error.message) : null,
  };
}

/**
 * Fetches a single LLM update by ID
 */
export async function getLlmUpdateById(id: string): Promise<{
  data: LlmUpdate | null;
  error: Error | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('llm_updates')
    .select('*')
    .eq('id', id)
    .single();

  return {
    data: data as LlmUpdate | null,
    error: error ? new Error(error.message) : null,
  };
}

/**
 * Creates a new LLM update
 */
export async function createLlmUpdate(update: LlmUpdateInsert): Promise<{
  data: LlmUpdate | null;
  error: Error | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('llm_updates')
    .insert(update as never)
    .select()
    .single();

  return {
    data: data as LlmUpdate | null,
    error: error ? new Error(error.message) : null,
  };
}

/**
 * Marks an LLM update as converted to tutorial
 */
export async function markAsConverted(id: string): Promise<{
  success: boolean;
  error: Error | null;
}> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('llm_updates')
    .update({ converted_to_tutorial: true } as never)
    .eq('id', id);

  return {
    success: !error,
    error: error ? new Error(error.message) : null,
  };
}

/**
 * Gets recent updates for a specific tool
 */
export async function getToolUpdates(toolName: string, limit = 10): Promise<{
  data: LlmUpdate[];
  error: Error | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('llm_updates')
    .select('*')
    .ilike('tool_name', `%${toolName}%`)
    .order('detected_at', { ascending: false })
    .limit(limit);

  return {
    data: (data as LlmUpdate[]) || [],
    error: error ? new Error(error.message) : null,
  };
}

/**
 * Gets update type counts for analytics
 */
export async function getUpdateTypeCounts(): Promise<{
  data: Record<string, number>;
  error: Error | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('llm_updates')
    .select('update_type');

  if (error) {
    return { data: {}, error: new Error(error.message) };
  }

  const counts: Record<string, number> = {};
  for (const row of (data as { update_type: string | null }[] | null) || []) {
    const type = row.update_type || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  }

  return { data: counts, error: null };
}
