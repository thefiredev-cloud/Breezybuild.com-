/**
 * Skills Library
 * Re-export all skills utilities
 */

// Filesystem operations
export {
  getSkillsDir,
  getSkillDir,
  getSkillPath,
  sanitizeSlug,
  generateSlug,
  skillExists,
  skillsDirExists,
  readSkillFile,
  getSkillStats,
  listSkillSlugs,
  scanAllSkillFiles,
  scanSkillsInLocation,
  ensureSkillsDir,
  writeSkillFile,
  deleteSkillFile,
  renameSkillDir,
  getSkillsSummary,
  isSlugAvailable,
} from './filesystem';
export type { SkillFile } from './filesystem';

// Parser & generator
export {
  parseFrontmatter,
  parseAllowedTools,
  parseSkillFile,
  generateFrontmatter,
  generateSkillContent,
  generateSkillFromRequest,
  parseMarkdownSections,
  generateMarkdownFromSections,
  validateSkillContent,
  validateSlug,
  generateSkillTemplate,
} from './parser';
export type { ValidationResult } from './parser';

// Service layer (database + filesystem)
export {
  createSkill,
  getSkill,
  getSkillByLocation,
  listSkills,
  getSkillCounts,
  updateSkill,
  toggleSkillActive,
  deleteSkill,
  syncSkillsToDatabase,
  syncSingleSkill,
  readSkillFromFilesystem,
  writeSkillToFilesystem,
} from './service';

// Auth middleware
export {
  verifyAdminAccess,
  verifyAuthenticated,
  withAdminAuth,
  withAuth,
  createErrorResponse,
  createSuccessResponse,
  extractSlugParam,
  extractSkillFilters,
} from './auth';
export type { AuthResult, AuthenticatedRequest } from './auth';
