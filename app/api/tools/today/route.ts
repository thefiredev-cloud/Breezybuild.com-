import { NextResponse } from 'next/server';
import { getTodaysTool, getLatestTool, getAdjacentTools } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/tools/today
 * Returns today's Tool of the Day, or the most recent tool if none exists for today
 */
export async function GET() {
  try {
    // Try to get today's tool first
    let tool = await getTodaysTool();

    // Fall back to latest published tool if no tool for today
    if (!tool) {
      tool = await getLatestTool();
    }

    if (!tool) {
      return NextResponse.json(
        { error: 'No tool content available' },
        { status: 404 }
      );
    }

    // Get adjacent tools for navigation
    const adjacent = await getAdjacentTools(tool.research_date);

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
    console.error('Error fetching today\'s tool:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool content' },
      { status: 500 }
    );
  }
}
