import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getLlmUpdates, createLlmUpdate } from '@/lib/llm-updates';
import type { LlmUpdateInsert } from '@/types/database.types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/llm-updates
 * List LLM updates with optional filters and pagination
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const filters = {
    tool_name: searchParams.get('tool_name') || undefined,
    update_type: searchParams.get('update_type') || undefined,
    converted_to_tutorial: searchParams.has('converted_to_tutorial')
      ? searchParams.get('converted_to_tutorial') === 'true'
      : undefined,
    limit: searchParams.has('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
    offset: searchParams.has('offset') ? parseInt(searchParams.get('offset')!, 10) : 0,
  };

  const { data, count, error } = await getLlmUpdates(filters);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: {
      total: count,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: filters.offset + data.length < count,
    },
  });
}

/**
 * POST /api/llm-updates
 * Create a new LLM update (admin only)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin via email whitelist
  const ADMIN_EMAILS = ['tanner@thefiredev.com'];
  if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  // Parse and validate request body
  let body: LlmUpdateInsert;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate required fields
  if (!body.tool_name || !body.summary) {
    return NextResponse.json(
      { error: 'Missing required fields: tool_name and summary are required' },
      { status: 400 }
    );
  }

  // Validate update_type if provided
  const validUpdateTypes = ['new_release', 'feature', 'breaking_change', 'deprecation', 'pricing', 'api_change', 'model_update'];
  if (body.update_type && !validUpdateTypes.includes(body.update_type)) {
    return NextResponse.json(
      { error: `Invalid update_type. Must be one of: ${validUpdateTypes.join(', ')}` },
      { status: 400 }
    );
  }

  const { data, error } = await createLlmUpdate(body);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
