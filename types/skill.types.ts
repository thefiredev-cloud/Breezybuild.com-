/**
 * Skill Type Definitions
 * Types for Claude skill MD file management
 */

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export type SkillStorageLocation = 'global' | 'local';

export type SkillStatus = 'active' | 'inactive' | 'draft';

export const ALLOWED_TOOLS = [
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'Bash',
  'Task',
  'WebFetch',
  'WebSearch',
  'TodoWrite',
  'AskUserQuestion',
  'mcp__github__*',
  'mcp__supabase__*',
  'mcp__netlify__*',
  'mcp__stripe__*',
  'mcp__memory__*',
  'mcp__puppeteer__*',
  'mcp__chrome-devtools__*',
  'mcp__brave-search__*',
  'mcp__sequential-thinking__*',
] as const;

export type AllowedTool = (typeof ALLOWED_TOOLS)[number];

export const TOOL_CATEGORIES = {
  'File Operations': ['Read', 'Write', 'Edit', 'Glob', 'Grep'],
  'System': ['Bash', 'Task', 'TodoWrite', 'AskUserQuestion'],
  'Web': ['WebFetch', 'WebSearch'],
  'MCP Integrations': [
    'mcp__github__*',
    'mcp__supabase__*',
    'mcp__netlify__*',
    'mcp__stripe__*',
    'mcp__memory__*',
    'mcp__puppeteer__*',
    'mcp__chrome-devtools__*',
    'mcp__brave-search__*',
    'mcp__sequential-thinking__*',
  ],
} as const;

// =====================================================
// SKILL FRONTMATTER (YAML Header)
// =====================================================

export interface SkillFrontmatter {
  name: string;
  description: string;
  'allowed-tools'?: string;
  tags?: string[];
}

// =====================================================
// SKILL SECTION TYPES
// =====================================================

export type SkillSectionType = 'when-to-use' | 'process' | 'best-practices' | 'custom';

export interface SkillSection {
  id: string;
  title: string;
  content: string;
  type: SkillSectionType;
  order: number;
}

export const DEFAULT_SECTIONS: Omit<SkillSection, 'id'>[] = [
  { title: 'When to Use', content: '', type: 'when-to-use', order: 0 },
  { title: 'Process', content: '', type: 'process', order: 1 },
  { title: 'Best Practices', content: '', type: 'best-practices', order: 2 },
];

// =====================================================
// MAIN SKILL INTERFACE
// =====================================================

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  allowed_tools: string[] | null;
  markdown_content: string;
  tags: string[];
  storage_location: SkillStorageLocation;
  file_path: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_synced_at: string | null;
}

// For parsed skill from filesystem (before DB insert)
export interface ParsedSkill {
  slug: string;
  name: string;
  description: string;
  allowed_tools: string[];
  markdown_content: string;
  tags: string[];
  storage_location: SkillStorageLocation;
  file_path: string;
}

// =====================================================
// REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateSkillRequest {
  slug?: string; // Auto-generated from name if not provided
  name: string;
  description: string;
  allowed_tools?: string[];
  markdown_content: string;
  tags?: string[];
  storage_location: SkillStorageLocation;
}

export interface UpdateSkillRequest {
  name?: string;
  description?: string;
  allowed_tools?: string[];
  markdown_content?: string;
  tags?: string[];
  is_active?: boolean;
}

export interface SkillListResponse {
  success: boolean;
  skills?: Skill[];
  total?: number;
  error?: string;
}

export interface SkillResponse {
  success: boolean;
  skill?: Skill;
  error?: string;
}

export interface SkillOperationResponse {
  success: boolean;
  message?: string;
  skill?: Skill;
  file_path?: string;
  error?: string;
}

export interface SyncSkillsResponse {
  success: boolean;
  created: number;
  updated: number;
  errors: string[];
}

// =====================================================
// FILTER & QUERY TYPES
// =====================================================

export interface SkillFilters {
  location?: SkillStorageLocation;
  tags?: string[];
  search?: string;
  activeOnly?: boolean;
}

// =====================================================
// FORM STATE TYPES (for UI)
// =====================================================

export interface SkillFormData {
  name: string;
  description: string;
  allowed_tools: string[];
  sections: SkillSection[];
  tags: string[];
  storage_location: SkillStorageLocation;
}

export interface SkillFormState {
  data: SkillFormData;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  activeTab: 'edit' | 'preview';
}
