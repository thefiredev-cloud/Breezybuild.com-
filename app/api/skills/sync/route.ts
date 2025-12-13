/**
 * Skills Sync API Route
 * POST /api/skills/sync - Sync filesystem skills to database
 */

import { NextResponse } from 'next/server';
import { withAdminAuth, createErrorResponse } from '@/lib/skills/auth';
import { syncSkillsToDatabase } from '@/lib/skills/service';
import type { SyncSkillsResponse } from '@/types/skill.types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/skills/sync
 * Scan both global and local skill directories and sync to database
 */
export const POST = withAdminAuth<SyncSkillsResponse>(async () => {
  try {
    const result = await syncSkillsToDatabase();

    return NextResponse.json({
      success: result.success,
      created: result.created,
      updated: result.updated,
      errors: result.errors,
    });
  } catch (error) {
    console.error('Error syncing skills:', error);
    return createErrorResponse<SyncSkillsResponse>(
      (error as Error).message || 'Failed to sync skills',
      500
    );
  }
});
