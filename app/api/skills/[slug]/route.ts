/**
 * Single Skill API Routes
 * GET /api/skills/[slug] - Get a skill by slug
 * PUT /api/skills/[slug] - Update a skill
 * DELETE /api/skills/[slug] - Delete a skill
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withAdminAuth,
  createErrorResponse,
} from '@/lib/skills/auth';
import {
  getSkill,
  updateSkill,
  deleteSkill,
} from '@/lib/skills/service';
import { validateSkillContent, generateSkillContent } from '@/lib/skills/parser';
import type {
  SkillResponse,
  SkillOperationResponse,
  UpdateSkillRequest,
} from '@/types/skill.types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/skills/[slug]
 * Get a single skill by slug
 */
export const GET = withAdminAuth<SkillResponse>(async (req: NextRequest, auth, context?: RouteParams) => {
  try {
    const params = context ? await context.params : null;
    const slug = params?.slug;

    if (!slug) {
      return createErrorResponse<SkillResponse>('Skill slug is required', 400);
    }

    const skill = await getSkill(slug);

    if (!skill) {
      return createErrorResponse<SkillResponse>('Skill not found', 404);
    }

    return NextResponse.json({
      success: true,
      skill,
    });
  } catch (error) {
    console.error('Error fetching skill:', error);
    return createErrorResponse<SkillResponse>(
      (error as Error).message || 'Failed to fetch skill',
      500
    );
  }
}) as (req: NextRequest, context: RouteParams) => Promise<NextResponse<SkillResponse>>;

/**
 * PUT /api/skills/[slug]
 * Update an existing skill
 */
export const PUT = withAdminAuth<SkillOperationResponse>(async (req: NextRequest, auth, context?: RouteParams) => {
  try {
    const params = context ? await context.params : null;
    const slug = params?.slug;

    if (!slug) {
      return createErrorResponse<SkillOperationResponse>('Skill slug is required', 400);
    }

    const body: UpdateSkillRequest = await req.json();

    // Check skill exists
    const existing = await getSkill(slug);
    if (!existing) {
      return createErrorResponse<SkillOperationResponse>('Skill not found', 404);
    }

    // If updating content, validate it
    if (body.markdown_content || body.name || body.description) {
      const content = generateSkillContent({
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        allowed_tools: body.allowed_tools ?? existing.allowed_tools ?? undefined,
        markdown_content: body.markdown_content ?? existing.markdown_content,
        tags: body.tags ?? existing.tags,
      });

      const validation = validateSkillContent(content);
      if (!validation.valid) {
        return createErrorResponse<SkillOperationResponse>(
          `Validation failed: ${validation.errors.join(', ')}`,
          400
        );
      }
    }

    // Update the skill
    const skill = await updateSkill(slug, body);

    return NextResponse.json({
      success: true,
      message: 'Skill updated successfully',
      skill,
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    return createErrorResponse<SkillOperationResponse>(
      (error as Error).message || 'Failed to update skill',
      500
    );
  }
}) as (req: NextRequest, context: RouteParams) => Promise<NextResponse<SkillOperationResponse>>;

/**
 * DELETE /api/skills/[slug]
 * Delete a skill
 */
export const DELETE = withAdminAuth<SkillOperationResponse>(async (req: NextRequest, auth, context?: RouteParams) => {
  try {
    const params = context ? await context.params : null;
    const slug = params?.slug;

    if (!slug) {
      return createErrorResponse<SkillOperationResponse>('Skill slug is required', 400);
    }

    // Check skill exists
    const existing = await getSkill(slug);
    if (!existing) {
      return createErrorResponse<SkillOperationResponse>('Skill not found', 404);
    }

    // Delete the skill
    await deleteSkill(slug);

    return NextResponse.json({
      success: true,
      message: `Skill "${existing.name}" deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return createErrorResponse<SkillOperationResponse>(
      (error as Error).message || 'Failed to delete skill',
      500
    );
  }
}) as (req: NextRequest, context: RouteParams) => Promise<NextResponse<SkillOperationResponse>>;
