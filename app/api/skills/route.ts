/**
 * Skills API Routes
 * GET /api/skills - List all skills
 * POST /api/skills - Create a new skill
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withAdminAuth,
  extractSkillFilters,
  createErrorResponse,
} from '@/lib/skills/auth';
import { logger } from '@/lib/logger';
import {
  listSkills,
  createSkill,
  getSkillCounts,
} from '@/lib/skills/service';
import { generateSlug, validateSkillContent, generateSkillContent } from '@/lib/skills/parser';
import type {
  SkillListResponse,
  SkillOperationResponse,
  CreateSkillRequest,
} from '@/types/skill.types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/skills
 * List all skills with optional filters
 */
export const GET = withAdminAuth<SkillListResponse>(async (req) => {
  try {
    const filters = extractSkillFilters(req);
    const skills = await listSkills(filters);
    const counts = await getSkillCounts();

    return NextResponse.json({
      success: true,
      skills,
      total: counts.total,
    });
  } catch (error) {
    logger.error('Error listing skills', { error: String(error), route: '/api/skills' });
    return createErrorResponse<SkillListResponse>(
      (error as Error).message || 'Failed to list skills',
      500
    );
  }
});

/**
 * POST /api/skills
 * Create a new skill
 */
export const POST = withAdminAuth<SkillOperationResponse>(async (req) => {
  try {
    const body: CreateSkillRequest = await req.json();

    // Validate required fields
    if (!body.name || !body.description || !body.markdown_content) {
      return createErrorResponse<SkillOperationResponse>(
        'Missing required fields: name, description, markdown_content',
        400
      );
    }

    // Validate storage location
    if (!body.storage_location || !['global', 'local'].includes(body.storage_location)) {
      return createErrorResponse<SkillOperationResponse>(
        'Invalid storage_location. Must be "global" or "local"',
        400
      );
    }

    // Generate slug if not provided
    const slug = body.slug || generateSlug(body.name);

    // Validate the generated content
    const content = generateSkillContent({
      name: body.name,
      description: body.description,
      allowed_tools: body.allowed_tools,
      markdown_content: body.markdown_content,
      tags: body.tags,
    });

    const validation = validateSkillContent(content);
    if (!validation.valid) {
      return createErrorResponse<SkillOperationResponse>(
        `Validation failed: ${validation.errors.join(', ')}`,
        400
      );
    }

    // Create the skill
    const skill = await createSkill({ ...body, slug });

    return NextResponse.json({
      success: true,
      message: 'Skill created successfully',
      skill,
      file_path: skill.file_path,
    });
  } catch (error) {
    logger.error('Error creating skill', { error: String(error), route: '/api/skills' });

    const message = (error as Error).message || 'Failed to create skill';

    // Handle duplicate slug
    if (message.includes('already exists')) {
      return createErrorResponse<SkillOperationResponse>(message, 409);
    }

    return createErrorResponse<SkillOperationResponse>(message, 500);
  }
});
