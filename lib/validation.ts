import { z } from 'zod';

// ============================================
// Skill Validation Schemas
// ============================================

export const skillSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  allowed_tools: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  storage_location: z.enum(['global', 'local']),
  markdown_content: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const createSkillSchema = skillSchema;

export const updateSkillSchema = skillSchema.partial().extend({
  slug: z.string().optional(), // Slug might not be editable
});

export type SkillFormData = z.infer<typeof skillSchema>;

// ============================================
// Post Validation Schemas
// ============================================

export const postSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(200, 'Slug must be less than 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  excerpt: z
    .string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters'),
  is_published: z.boolean().optional(),
  published_at: z.string().datetime().optional().nullable(),
});

export const createPostSchema = postSchema;
export const updatePostSchema = postSchema.partial();

export type PostFormData = z.infer<typeof postSchema>;

// ============================================
// Email Validation
// ============================================

export const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export type EmailFormData = z.infer<typeof emailSchema>;

// ============================================
// Profile Validation
// ============================================

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  avatar_url: z.string().url('Please enter a valid URL').optional().nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// ============================================
// Validation Helpers
// ============================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export function validateSkill(data: unknown): ValidationResult<SkillFormData> {
  const result = skillSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

export function validatePost(data: unknown): ValidationResult<PostFormData> {
  const result = postSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

export function validateEmail(data: unknown): ValidationResult<EmailFormData> {
  const result = emailSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

export function validateProfile(data: unknown): ValidationResult<ProfileFormData> {
  const result = profileSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

// Helper to format Zod errors into a simple object
function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  return errors;
}

// Generic validation function
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}
