/**
 * Skills Filesystem Operations
 * Read/write skill MD files to global (~/.claude/skills/) or local (./skills/) directories
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import type { SkillStorageLocation } from '@/types/skill.types';

// =====================================================
// CONSTANTS
// =====================================================

const GLOBAL_SKILLS_DIR = path.join(os.homedir(), '.claude', 'skills');
const LOCAL_SKILLS_DIR = path.join(process.cwd(), 'skills');
const SKILL_FILENAME = 'SKILL.md';

// =====================================================
// TYPES
// =====================================================

export interface SkillFile {
  slug: string;
  filePath: string;
  content: string;
  location: SkillStorageLocation;
  modifiedAt: Date;
}

// =====================================================
// PATH UTILITIES
// =====================================================

/**
 * Get the skills directory path for a storage location
 */
export function getSkillsDir(location: SkillStorageLocation): string {
  return location === 'global' ? GLOBAL_SKILLS_DIR : LOCAL_SKILLS_DIR;
}

/**
 * Get the full path to a skill directory
 */
export function getSkillDir(slug: string, location: SkillStorageLocation): string {
  return path.join(getSkillsDir(location), slug);
}

/**
 * Get the full path to a skill file
 */
export function getSkillPath(slug: string, location: SkillStorageLocation): string {
  return path.join(getSkillDir(slug, location), SKILL_FILENAME);
}

/**
 * Sanitize a slug to prevent path traversal attacks
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a slug from a skill name
 */
export function generateSlug(name: string): string {
  return sanitizeSlug(name);
}

// =====================================================
// FILE EXISTENCE CHECKS
// =====================================================

/**
 * Check if a skill directory exists
 */
export async function skillExists(
  slug: string,
  location: SkillStorageLocation
): Promise<boolean> {
  try {
    const skillPath = getSkillPath(slug, location);
    await fs.access(skillPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if skills directory exists for a location
 */
export async function skillsDirExists(location: SkillStorageLocation): Promise<boolean> {
  try {
    const dir = getSkillsDir(location);
    await fs.access(dir);
    return true;
  } catch {
    return false;
  }
}

// =====================================================
// READ OPERATIONS
// =====================================================

/**
 * Read a skill file from the file system
 */
export async function readSkillFile(
  slug: string,
  location: SkillStorageLocation
): Promise<string | null> {
  try {
    const filePath = getSkillPath(slug, location);
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Get file stats for a skill
 */
export async function getSkillStats(
  slug: string,
  location: SkillStorageLocation
): Promise<{ modifiedAt: Date; size: number } | null> {
  try {
    const filePath = getSkillPath(slug, location);
    const stats = await fs.stat(filePath);
    return {
      modifiedAt: stats.mtime,
      size: stats.size,
    };
  } catch {
    return null;
  }
}

/**
 * List all skill directories (slugs) in a location
 */
export async function listSkillSlugs(location: SkillStorageLocation): Promise<string[]> {
  try {
    const dir = getSkillsDir(location);
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const slugs: string[] = [];
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        // Verify the directory contains a SKILL.md file
        const skillPath = path.join(dir, entry.name, SKILL_FILENAME);
        try {
          await fs.access(skillPath);
          slugs.push(entry.name);
        } catch {
          // Directory exists but no SKILL.md, skip it
        }
      }
    }

    return slugs.sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Scan and return all skill files from both locations
 */
export async function scanAllSkillFiles(): Promise<SkillFile[]> {
  const results: SkillFile[] = [];
  const locations: SkillStorageLocation[] = ['global', 'local'];

  for (const location of locations) {
    const slugs = await listSkillSlugs(location);

    for (const slug of slugs) {
      const content = await readSkillFile(slug, location);
      const stats = await getSkillStats(slug, location);

      if (content && stats) {
        results.push({
          slug,
          filePath: getSkillPath(slug, location),
          content,
          location,
          modifiedAt: stats.modifiedAt,
        });
      }
    }
  }

  return results;
}

/**
 * Scan skill files from a specific location only
 */
export async function scanSkillsInLocation(
  location: SkillStorageLocation
): Promise<SkillFile[]> {
  const results: SkillFile[] = [];
  const slugs = await listSkillSlugs(location);

  for (const slug of slugs) {
    const content = await readSkillFile(slug, location);
    const stats = await getSkillStats(slug, location);

    if (content && stats) {
      results.push({
        slug,
        filePath: getSkillPath(slug, location),
        content,
        location,
        modifiedAt: stats.modifiedAt,
      });
    }
  }

  return results;
}

// =====================================================
// WRITE OPERATIONS
// =====================================================

/**
 * Ensure the skills directory exists
 */
export async function ensureSkillsDir(location: SkillStorageLocation): Promise<void> {
  const dir = getSkillsDir(location);
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Write a skill file to the file system
 */
export async function writeSkillFile(
  slug: string,
  content: string,
  location: SkillStorageLocation
): Promise<string> {
  // Sanitize slug for safety
  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) {
    throw new Error('Invalid skill slug');
  }

  const skillDir = getSkillDir(safeSlug, location);
  const filePath = path.join(skillDir, SKILL_FILENAME);

  // Ensure directory exists
  await fs.mkdir(skillDir, { recursive: true });

  // Write file
  await fs.writeFile(filePath, content, 'utf-8');

  return filePath;
}

/**
 * Delete a skill directory from the file system
 */
export async function deleteSkillFile(
  slug: string,
  location: SkillStorageLocation
): Promise<void> {
  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) {
    throw new Error('Invalid skill slug');
  }

  const skillDir = getSkillDir(safeSlug, location);
  await fs.rm(skillDir, { recursive: true, force: true });
}

/**
 * Rename a skill directory (when slug changes)
 */
export async function renameSkillDir(
  oldSlug: string,
  newSlug: string,
  location: SkillStorageLocation
): Promise<string> {
  const safeOldSlug = sanitizeSlug(oldSlug);
  const safeNewSlug = sanitizeSlug(newSlug);

  if (!safeOldSlug || !safeNewSlug) {
    throw new Error('Invalid skill slug');
  }

  const oldDir = getSkillDir(safeOldSlug, location);
  const newDir = getSkillDir(safeNewSlug, location);

  await fs.rename(oldDir, newDir);
  return getSkillPath(safeNewSlug, location);
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get summary info about skills in both locations
 */
export async function getSkillsSummary(): Promise<{
  global: { count: number; path: string };
  local: { count: number; path: string };
}> {
  const globalSlugs = await listSkillSlugs('global');
  const localSlugs = await listSkillSlugs('local');

  return {
    global: {
      count: globalSlugs.length,
      path: GLOBAL_SKILLS_DIR,
    },
    local: {
      count: localSlugs.length,
      path: LOCAL_SKILLS_DIR,
    },
  };
}

/**
 * Check if a skill slug is available (doesn't exist in either location)
 */
export async function isSlugAvailable(slug: string): Promise<{
  available: boolean;
  existsIn?: SkillStorageLocation;
}> {
  const safeSlug = sanitizeSlug(slug);

  if (await skillExists(safeSlug, 'global')) {
    return { available: false, existsIn: 'global' };
  }

  if (await skillExists(safeSlug, 'local')) {
    return { available: false, existsIn: 'local' };
  }

  return { available: true };
}
