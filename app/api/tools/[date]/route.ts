import { NextRequest, NextResponse } from 'next/server';
import { getToolByDate, getAdjacentTools } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tools/[date]
 * Returns tool content for a specific date
 *
 * Path params:
 * - date: Date in YYYY-MM-DD format
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const tool = await getToolByDate(date);

    if (!tool) {
      return NextResponse.json(
        { error: 'No tool found for this date' },
        { status: 404 }
      );
    }

    // Get adjacent tools for navigation
    const adjacent = await getAdjacentTools(date);

    return NextResponse.json({
      tool,
      navigation: {
        hasPrevious: !!adjacent.previous,
        hasNext: !!adjacent.next,
        previousDate: adjacent.previous?.research_date || null,
        nextDate: adjacent.next?.research_date || null,
      },
    });
  } catch (error) {
    console.error('Error fetching tool by date:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool content' },
      { status: 500 }
    );
  }
}
