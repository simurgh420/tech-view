// lib/validation/comment.ts
import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(3, 'متن کامنت حداقل ۳ کاراکتر').max(1000, 'حداکثر ۱۰۰۰ کاراکتر'),
  rating: z.number().int().min(1, 'حداقل امتیاز ۱').max(5, 'حداکثر امتیاز ۵'),
});

export const updateCommentSchema = z.object({
  content: z.string().min(3).max(1000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
