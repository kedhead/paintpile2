import { z } from 'zod';

// Authentication Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Project Schemas
export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  status: z.enum(['not-started', 'in-progress', 'completed'], {
    required_error: 'Please select a status',
  }),
  quantity: z.number().int().min(1).max(10000).optional(),
  tags: z.array(z.string().min(1).max(20)).max(10).optional(),
  startDate: z.date().optional(),
});

// Profile Schemas
export const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username is too long')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
    .optional(),
  bio: z.string().max(200, 'Bio is too long').optional(),
});

// Post Schemas
export const postSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(2000, 'Post is too long'),
  tags: z.array(z.string().min(1).max(20)).max(10).optional(),
  isPublic: z.boolean().default(true),
});

// Comment Schemas
export const commentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(1000, 'Comment is too long'),
});

// Message Schemas
export const messageSchema = z.object({
  content: z.string().min(1, 'Message is required').max(2000, 'Message is too long'),
  imageUrl: z.string().url().optional(),
  replyToId: z.string().uuid().optional(),
});

// Pile Schemas
export const pileItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  type: z.enum(['warhammer', 'd&d', 'historical', 'board-game', 'other'], {
    required_error: 'Please select a type',
  }),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  status: z.enum(['unpainted', 'painting', 'painted'], {
    required_error: 'Please select a status',
  }),
  notes: z.string().max(500).optional(),
});

// Photo Upload Schema
export const photoUploadSchema = z.object({
  caption: z.string().max(200, 'Caption is too long').optional(),
});

// Paint Schemas
export const customPaintSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  name: z.string().min(1, 'Paint name is required'),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
});

// Recipe Schemas
export const recipeIngredientSchema = z.object({
  paintId: z.string().min(1, 'Paint is required'),
  role: z.string().min(1, 'Paint role is required'),
  ratio: z.string().max(50).optional(),
  order: z.number().int().min(0),
  notes: z.string().max(200).optional(),
});

export const recipeStepSchema = z.object({
  stepNumber: z.number().int().min(1),
  title: z.string().min(1, 'Step title is required').max(100),
  instruction: z.string().min(1, 'Instruction is required').max(1000),
  photoUrl: z.union([z.string().url(), z.literal('')]).optional(),
  paints: z.array(z.string()).optional(),
  technique: z.string().max(50).optional(),
  tips: z.array(z.string().max(200)).optional(),
  estimatedTime: z.union([z.number().int().min(0), z.string(), z.literal('')]).optional(),
});

export const recipeSchema = z.object({
  name: z.string().min(1, 'Recipe name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  category: z.enum([
    'skin-tone', 'metallic', 'fabric', 'leather', 'armor', 'weapon',
    'wood', 'stone', 'nmm', 'osl', 'weathering', 'glow-effect',
    'gem', 'base-terrain', 'other',
  ], { required_error: 'Please select a category' }),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Please select difficulty',
  }),
  ingredients: z.array(recipeIngredientSchema).min(1, 'At least one ingredient is required'),
  techniques: z.array(z.string().max(50)).max(10).optional(),
  steps: z.array(recipeStepSchema).optional(),
  mixingInstructions: z.string().max(1000).optional(),
  applicationTips: z.string().max(1000).optional(),
  resultColor: z.union([z.string().regex(/^#[0-9A-Fa-f]{6}$/), z.literal('')]).optional(),
  estimatedTime: z.union([z.number().int().min(0), z.string(), z.literal('')]).optional(),
  surfaceType: z.union([
    z.enum(['armor', 'skin', 'fabric', 'leather', 'metal', 'wood', 'stone', 'gem', 'other']),
    z.literal(''),
  ]).optional(),
  tags: z.array(z.string().min(1).max(20)).max(10).optional(),
  isPublic: z.boolean(),
  isGlobal: z.boolean(),
});

// Inferred types from Zod schemas (suffixed to avoid collision with domain types)
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;
export type CustomPaintInput = z.infer<typeof customPaintSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type RecipeInput = z.infer<typeof recipeSchema>;
