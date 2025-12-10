// src/lib/validation/blog.ts

import { z } from 'zod';
export const createPostSchema = z.object({
  title: z.string().min(3),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().min(16),
  content: z.string().min(20),
  coverImageUrl: z.url(),
  readingMinutes: z.number().min(1).max(30),
  author: z.string().min(2),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
});
