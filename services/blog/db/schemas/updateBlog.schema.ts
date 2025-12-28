//updateBlog.schema.ts

import z from 'zod';

export const updateBlogSchema = z.object({
  title: z.string().min(3).optional(),
  excerpt: z.string().min(10).optional(),
  content: z.string().min(20).optional(),
  coverImageUrl: z.string().optional(),
  author: z.string().min(3).optional(),
  tags: z.array(z.string().min(2)).optional(),
});
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
