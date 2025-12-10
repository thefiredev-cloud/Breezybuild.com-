import { NextRequest, NextResponse } from 'next/server';
import { getToolsFiltered, ToolCategory } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tools/archive
 * Returns paginated archive of tools with optional filters
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 50)
 * - category: Filter by category (ai_coding, devops, etc.)
 * - search: Search in title/tagline
 * - minLearningCurve: Minimum learning curve score (1-5)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const category = searchParams.get('category') as ToolCategory | null;
    const search = searchParams.get('search') || undefined;
    const minLearningCurve = searchParams.get('minLearningCurve')
      ? parseInt(searchParams.get('minLearningCurve')!)
      : undefined;

    const offset = (page - 1) * limit;

    const { tools, total } = await getToolsFiltered({
      limit,
      offset,
      category: category || undefined,
      search,
      minLearningCurve,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      tools,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching tool archive:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool archive' },
      { status: 500 }
    );
  }
}
