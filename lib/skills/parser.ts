/**
 * Skills Parser & Generator
 * Parse YAML frontmatter from skill files and generate skill content
 */

import type {
  SkillFrontmatter,
  ParsedSkill,
  SkillSection,
  SkillStorageLocation,
  CreateSkillRequest,
} from '@/types/skill.types';

// =====================================================
// CONSTANTS
// =====================================================

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
const YAML_LINE_REGEX = /^([^:]+):\s*(.*)$/;

// =====================================================
// YAML FRONTMATTER PARSING
// =====================================================

/**
 * Parse YAML frontmatter from skill content
 */
export function parseFrontmatter(content: string): {
  frontmatter: SkillFrontmatter;
  markdown: string;
} | null {
  const trimmed = content.trim();
  const match = trimmed.match(FRONTMATTER_REGEX);

  if (!match) {
    return null;
  }

  const [, yamlContent, markdown] = match;
  const frontmatter: Partial<SkillFrontmatter> = {};

  // Simple YAML parser for frontmatter
  const lines = yamlContent.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const lineMatch = trimmedLine.match(YAML_LINE_REGEX);
    if (!lineMatch) continue;

    const [, key, rawValue] = lineMatch;
    const cleanKey = key.trim();
    let value = rawValue.trim();

    // Handle arrays (tags: ["tag1", "tag2"] or tags: [tag1, tag2])
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1);
      const items = arrayContent
        .split(',')
        .map((v) => v.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      (frontmatter as Record<string, unknown>)[cleanKey] = items;
    } else {
      // Remove surrounding quotes if present
      value = value.replace(/^["']|["']$/g, '');
      (frontmatter as Record<string, unknown>)[cleanKey] = value;
    }
  }

  return {
    frontmatter: frontmatter as SkillFrontmatter,
    markdown: markdown.trim(),
  };
}

/**
 * Parse allowed-tools string into array
 */
export function parseAllowedTools(toolsString: string | undefined): string[] {
  if (!toolsString) return [];
  return toolsString
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Parse a complete skill file into a ParsedSkill object
 */
export function parseSkillFile(
  content: string,
  slug: string,
  location: SkillStorageLocation,
  filePath: string
): ParsedSkill | null {
  const parsed = parseFrontmatter(content);
  if (!parsed) return null;

  const { frontmatter, markdown } = parsed;

  return {
    slug,
    name: frontmatter.name || slug,
    description: frontmatter.description || '',
    allowed_tools: parseAllowedTools(frontmatter['allowed-tools']),
    markdown_content: markdown,
    tags: frontmatter.tags || [],
    storage_location: location,
    file_path: filePath,
  };
}

// =====================================================
// CONTENT GENERATION
// =====================================================

/**
 * Generate YAML frontmatter string
 */
export function generateFrontmatter(data: {
  name: string;
  description: string;
  allowed_tools?: string[];
  tags?: string[];
}): string {
  const lines = ['---', `name: ${data.name}`, `description: ${data.description}`];

  if (data.allowed_tools && data.allowed_tools.length > 0) {
    lines.push(`allowed-tools: ${data.allowed_tools.join(', ')}`);
  }

  if (data.tags && data.tags.length > 0) {
    lines.push(`tags: [${data.tags.map((t) => `"${t}"`).join(', ')}]`);
  }

  lines.push('---');
  return lines.join('\n');
}

/**
 * Generate complete skill markdown content with frontmatter
 */
export function generateSkillContent(data: {
  name: string;
  description: string;
  allowed_tools?: string[];
  markdown_content: string;
  tags?: string[];
}): string {
  const frontmatter = generateFrontmatter({
    name: data.name,
    description: data.description,
    allowed_tools: data.allowed_tools,
    tags: data.tags,
  });

  return `${frontmatter}\n\n${data.markdown_content}`;
}

/**
 * Generate skill content from CreateSkillRequest
 */
export function generateSkillFromRequest(request: CreateSkillRequest): string {
  return generateSkillContent({
    name: request.name,
    description: request.description,
    allowed_tools: request.allowed_tools,
    markdown_content: request.markdown_content,
    tags: request.tags,
  });
}

// =====================================================
// SECTION PARSING & GENERATION
// =====================================================

/**
 * Parse markdown content into sections
 */
export function parseMarkdownSections(markdown: string): SkillSection[] {
  const sections: SkillSection[] = [];
  const lines = markdown.split('\n');

  let currentSection: Partial<SkillSection> | null = null;
  let currentContent: string[] = [];
  let sectionOrder = 0;

  for (const line of lines) {
    // Check for h2 headers (## Section Title)
    const h2Match = line.match(/^##\s+(.+)$/);

    if (h2Match) {
      // Save previous section if exists
      if (currentSection) {
        sections.push({
          id: generateSectionId(currentSection.title || ''),
          title: currentSection.title || '',
          content: currentContent.join('\n').trim(),
          type: inferSectionType(currentSection.title || ''),
          order: sectionOrder++,
        });
      }

      // Start new section
      currentSection = { title: h2Match[1].trim() };
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    } else {
      // Content before first section - treat as intro
      if (line.trim()) {
        if (!currentSection) {
          currentSection = { title: 'Introduction' };
          currentContent = [];
        }
        currentContent.push(line);
      }
    }
  }

  // Save last section
  if (currentSection) {
    sections.push({
      id: generateSectionId(currentSection.title || ''),
      title: currentSection.title || '',
      content: currentContent.join('\n').trim(),
      type: inferSectionType(currentSection.title || ''),
      order: sectionOrder,
    });
  }

  return sections;
}

/**
 * Generate markdown content from sections
 */
export function generateMarkdownFromSections(sections: SkillSection[]): string {
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return sortedSections
    .map((section) => {
      return `## ${section.title}\n\n${section.content}`;
    })
    .join('\n\n');
}

/**
 * Generate a section ID from title
 */
function generateSectionId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Infer section type from title
 */
function inferSectionType(title: string): SkillSection['type'] {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('when to use') || lowerTitle.includes('when')) {
    return 'when-to-use';
  }
  if (lowerTitle.includes('process') || lowerTitle.includes('steps') || lowerTitle.includes('workflow')) {
    return 'process';
  }
  if (lowerTitle.includes('best practice') || lowerTitle.includes('tips') || lowerTitle.includes('guidelines')) {
    return 'best-practices';
  }
  return 'custom';
}

// =====================================================
// VALIDATION
// =====================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate skill content structure
 */
export function validateSkillContent(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for frontmatter
  const parsed = parseFrontmatter(content);
  if (!parsed) {
    errors.push('Invalid or missing YAML frontmatter (must start with --- and end with ---)');
    return { valid: false, errors, warnings };
  }

  const { frontmatter, markdown } = parsed;

  // Required fields
  if (!frontmatter.name || frontmatter.name.trim() === '') {
    errors.push('Skill name is required in frontmatter');
  }

  if (!frontmatter.description || frontmatter.description.trim() === '') {
    errors.push('Skill description is required in frontmatter');
  }

  // Markdown content
  if (!markdown || markdown.trim() === '') {
    errors.push('Skill must have markdown content after frontmatter');
  }

  // Warnings (non-blocking)
  if (!frontmatter['allowed-tools']) {
    warnings.push('No allowed-tools specified - skill may have limited capabilities');
  }

  if (!frontmatter.tags || frontmatter.tags.length === 0) {
    warnings.push('No tags specified - consider adding tags for better organization');
  }

  // Check for common sections
  const sections = parseMarkdownSections(markdown);
  const sectionTitles = sections.map((s) => s.title.toLowerCase());

  if (!sectionTitles.some((t) => t.includes('when'))) {
    warnings.push('Consider adding a "When to Use" section');
  }

  if (!sectionTitles.some((t) => t.includes('process') || t.includes('steps'))) {
    warnings.push('Consider adding a "Process" section with step-by-step instructions');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a skill slug
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: 'Slug is required' };
  }

  if (slug.length < 2) {
    return { valid: false, error: 'Slug must be at least 2 characters' };
  }

  if (slug.length > 50) {
    return { valid: false, error: 'Slug must be 50 characters or less' };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
  }

  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug cannot start or end with a hyphen' };
  }

  return { valid: true };
}

// =====================================================
// TEMPLATE GENERATION
// =====================================================

/**
 * Generate a default skill template
 */
export function generateSkillTemplate(name: string, description: string): string {
  return generateSkillContent({
    name,
    description,
    allowed_tools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash', 'Task'],
    tags: [],
    markdown_content: `# ${name}

This skill guides you through ${description.toLowerCase()}.

## When to Use

- Use this skill when...
- This is helpful for...

## Process

### 1. First Step
- Description of what to do
- Key considerations

### 2. Second Step
- Description of what to do
- Key considerations

### 3. Third Step
- Description of what to do
- Key considerations

## Best Practices

- Follow this guideline...
- Remember to...
- Avoid doing...
`,
  });
}
