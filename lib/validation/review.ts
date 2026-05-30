import { z } from 'zod';

export const createReviewSchema = z.object({
  productSlug: z.string().min(1, 'شناسه محصول الزامی است'),
  rating: z.number().int().min(1, 'امتیاز باید حداقل ۱ باشد').max(5, 'امتیاز باید حداکثر ۵ باشد'),
  title: z.string().optional(),
  content: z.string().min(10, 'متن نظر حداقل ۱۰ کاراکتر'),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().optional(),
  content: z.string().min(10).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
