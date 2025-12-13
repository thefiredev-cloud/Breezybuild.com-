/**
 * Skills Service Layer
 * CRUD operations coordinating filesystem + database
 */

import { supabaseAdmin } from '@/lib/supabase';
import type {
  Skill,
  CreateSkillRequest,
  UpdateSkillRequest,
  SkillFilters,
  ParsedSkill,
  SyncSkillsResponse,
} from '@/types/skill.types';
import {
  writeSkillFile,
  deleteSkillFile,
  readSkillFile,
  scanAllSkillFiles,
  getSkillPath,
  skillExists,
  generateSlug,
} from './filesystem';
import {
  generateSkillContent,
  parseFrontmatter,
  parseAllowedTools,
  validateSkillContent,
  parseSkillFile,
} from './parser';

// =====================================================
// CREATE OPERATIONS
// =====================================================

/**
 * Create a new skill (writes to filesystem and database)
 */
export async function createSkill(data: CreateSkillRequest): Promise<Skill> {
  if (!supabaseAdmin) {
    throw new Error('Database client not available');
  }

  // Generate slug if not provided
  const slug = data.slug || generateSlug(data.name);

  // Check if slug already exists
  const existsInGlobal = await skillExists(slug, 'global');
  const existsInLocal = await skillExists(slug, 'local');

  if (existsInGlobal || existsInLocal) {
    throw new Error(`Skill with slug "${slug}" already exists`);
  }

  // Generate the markdown content with frontmatter
  const content = generateSkillContent({
    name: data.name,
    description: data.description,
    allowed_tools: data.allowed_tools,
    markdown_content: data.markdown_content,
    tags: data.tags,
  });

  // Validate content
  const validation = validateSkillContent(content);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Write to file system
  const filePath = await writeSkillFile(slug, content, data.storage_location);

  // Insert into database
  const { data: skill, error } = await supabaseAdmin
    .from('skills')
    .insert({
      slug,
      name: data.name,
      description: data.description,
      allowed_tools: data.allowed_tools || null,
      markdown_content: data.markdown_content,
      tags: data.tags || [],
      storage_location: data.storage_location,
      file_path: filePath,
      last_synced_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    // Rollback: delete the file we just created
    await deleteSkillFile(slug, data.storage_location).catch(() => {});
    throw new Error(`Database error: ${error.message}`);
  }

  return skill as Skill;
}

// =====================================================
// READ OPERATIONS
// =====================================================

/**
 * Get a single skill by slug
 */
export async function getSkill(slug: string): Promise<Skill | null> {
  if (!supabaseAdmin) {
    throw new Error('Database client not available');
  }

  const { data, error } = await supabaseAdmin
    .from('skills')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Skill;
}

/**
 * Get a skill by slug and location
 */
export async function getSkillByLocation(
  slug: string,
  location: 'global' | 'local'
): Promise<Skill | null> {
  if (!supabaseAdmin) {
    throw new Error('Database client not available');
  }

  const { data, error } = await supabaseAdmin
    .from('skills')
    .select('*')
    .eq('slug', slug)
    .eq('storage_location', location)
    .single();

  if (error || !data) return null;
  return data as Skill;
}

/**
 * List skills with optional filters
 */
export async function listSkills(filters?: SkillFilters): Promise<Skill[]> {
  if (!supabaseAdmin) {
    throw new Error('Database client not available');
  }

  let query = supabaseAdmin.from('skills').select('*');

  if (filters?.location) {
    query = query.eq('storage_location', filters.location);
  }

  if (filters?.activeOnly !== false) {
    query = query.eq('is_active', true);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query.order('name');

  if (error) throw new Error(`Database error: ${error.message}`);
  return (data as Skill[]) || [];
}

/**
 * Get skill count by location
 */
export async function getSkillCounts(): Promise<{
  total: number;
  global: number;
  local: number;
  active: number;
}> {
  if (!supabaseAdmin) {
    throw new Error('Database client not available');
  }

  const { data, error } = await supabaseAdmin.from('skills').select('storage_location, is_active');

  if (error) throw new Error(`Database error: ${error.message}`);

  const skills = data || [];
  return {
    total: skills.length,
    global: skills.filter((s) => s.storage_location === 'global').length,
    local: skills.filter((s) => s.storage_location === 'local').length,
    active: skills.filter((s) => s.is_active).length,
  };
}

// =====================================================
// UPDATE OPERATIONS
// =====================================================

/**
 * Update an existing skill
 */
export async function updateSkill(
  slug: string,
  data: UpdateSkillRequest
): Promise<Skill> {
  if (!supabaseAdmin) {
    throw new Error('Database client not available');
  }

  // Get current skill to know the location
  const current = await getSkill(slug);
  if (!current) {
    throw new Error('Skill not found');
  }

  // Merge with existing data
  const updated = {
    name: data.name ?? current.name,
    description: data.description ?? current.description,
    allowed_tools: data.allowed_tools ?? current.allowed_tools,
    markdown_content: data.markdown_content ?? current.markdown_content,
    tags: data.tags ?? current.tags,
    is_active: data.is_active ?? current.is_active,
  };

  // Regenerate file content
  const content = generateSkillContent({
    name: updated.name,
    description: updated.description,
    allowed_tools: updated.allowed_tools || undefined,
    markdown_content: updated.markdown_content,
    tags: updated.tags,
  });

  // Validate content
  const validation = validateSkillContent(content);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Write to file system
  await writeSkillFile(slug, content, current.storage_location);

  // Update database
  const { data: skill, error } = await supabaseAdmin
    .from('skills')
    .update({
      ...updated,
      last_synced_at: new Date().toISOString(),
    })
    .eq('slug', slug)
    .select()
    .single();

  if (error) throw new Error(`Database error: ${error.message}`);
  return skill as Skill;
}

/**
 * Toggle skill active status
 */
export async function toggleSkillActive(slug: string): Promise<Skill> {
  const current = await getSkill(slug);
  if (!current) {
    throw new Error('Skill not found');
  }

  return updateSkill(slug, { is_active: !current.is_active });
}

// =====================================================
// DELETE OPERATIONS
// =====================================================

/**
 * Delete a skill
 */
export async function deleteSkill(slug: string): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error('Database client not available');
  }

  // Get skill to know location
  const skill = await getSkill(slug);
  if (!skill) {
    throw new Error('Skill not found');
  }

  // Delete from filesystem
  await deleteSkillFile(slug, skill.storage_location);

  // Delete from database
  const { error } = await supabaseAdmin.from('skills').delete().eq('slug', slug);

  if (error) throw new Error(`Database error: ${error.message}`);
}

// =====================================================
// SYNC OPERATIONS
// =====================================================

/**
 * Sync filesystem skills to database
 * Scans both global and local directories, creates/updates DB records
 */
export async function syncSkillsToDatabase(): Promise<SyncSkillsResponse> {
  if (!supabaseAdmin) {
    throw new Error('Database client not available');
  }

  const results: SyncSkillsResponse = {
    success: true,
    created: 0,
    updated: 0,
    errors: [],
  };

  const skillFiles = await scanAllSkillFiles();

  for (const file of skillFiles) {
    try {
      const parsed = parseFrontmatter(file.content);
      if (!parsed) {
        results.errors.push(`Failed to parse: ${file.slug}`);
        continue;
      }

      const { frontmatter, markdown } = parsed;

      // Check if exists in database
      const { data: existing } = await supabaseAdmin
        .from('skills')
        .select('id')
        .eq('slug', file.slug)
        .eq('storage_location', file.location)
        .single();

      const skillData = {
        slug: file.slug,
        name: frontmatter.name || file.slug,
        description: frontmatter.description || '',
        allowed_tools: parseAllowedTools(frontmatter['allowed-tools']),
        markdown_content: markdown,
        tags: frontmatter.tags || [],
        storage_location: file.location,
        file_path: file.filePath,
        last_synced_at: new Date().toISOString(),
      };

      if (existing) {
        // Update
        const { error } = await supabaseAdmin
          .from('skills')
          .update(skillData)
          .eq('id', existing.id);

        if (error) {
          results.errors.push(`Error updating ${file.slug}: ${error.message}`);
        } else {
          results.updated++;
        }
      } else {
        // Insert
        const { error } = await supabaseAdmin.from('skills').insert(skillData);

        if (error) {
          results.errors.push(`Error creating ${file.slug}: ${error.message}`);
        } else {
          results.created++;
        }
      }
    } catch (error) {
      results.errors.push(
        `Error syncing ${file.slug}: ${(error as Error).message}`
      );
    }
  }

  results.success = results.errors.length === 0;
  return results;
}

/**
 * Sync a single skill from filesystem to database
 */
export async function syncSingleSkill(
  slug: string,
  location: 'global' | 'local'
): Promise<Skill | null> {
  if (!supabaseAdmin) {
    throw new Error('Database client not available');
  }

  const content = await readSkillFile(slug, location);
  if (!content) return null;

  const filePath = getSkillPath(slug, location);
  const parsed = parseSkillFile(content, slug, location, filePath);
  if (!parsed) return null;

  // Check if exists
  const existing = await getSkillByLocation(slug, location);

  const skillData = {
    slug: parsed.slug,
    name: parsed.name,
    description: parsed.description,
    allowed_tools: parsed.allowed_tools,
    markdown_content: parsed.markdown_content,
    tags: parsed.tags,
    storage_location: parsed.storage_location,
    file_path: parsed.file_path,
    last_synced_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('skills')
      .update(skillData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    return data as Skill;
  } else {
    const { data, error } = await supabaseAdmin
      .from('skills')
      .insert(skillData)
      .select()
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    return data as Skill;
  }
}

// =====================================================
// RAW FILE OPERATIONS (without database)
// =====================================================

/**
 * Read skill directly from filesystem (bypasses database)
 */
export async function readSkillFromFilesystem(
  slug: string,
  location: 'global' | 'local'
): Promise<ParsedSkill | null> {
  const content = await readSkillFile(slug, location);
  if (!content) return null;

  const filePath = getSkillPath(slug, location);
  return parseSkillFile(content, slug, location, filePath);
}

/**
 * Write skill directly to filesystem (bypasses database)
 */
export async function writeSkillToFilesystem(
  slug: string,
  location: 'global' | 'local',
  data: {
    name: string;
    description: string;
    allowed_tools?: string[];
    markdown_content: string;
    tags?: string[];
  }
): Promise<string> {
  const content = generateSkillContent(data);
  return writeSkillFile(slug, content, location);
}
