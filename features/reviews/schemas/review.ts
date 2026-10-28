import { z } from 'zod';

export const createReviewSchema = z.object({
  productSlug: z.string().min(1, 'شناسه محصول الزامی است'),
  rating: z.number().int().min(1, 'امتیاز باید حداقل ۱ باشد').max(5, 'امتیاز باید حداکثر ۵ باشد'),
  title: z.string().trim().min(1).max(120, 'عنوان حداکثر ۱۲۰ کاراکتر').optional(),
  content: z.string().min(10, 'متن نظر حداقل ۱۰ کاراکتر').max(2000, 'متن نظر حداکثر ۲۰۰۰ کاراکتر'),
});

export const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().trim().min(1).max(120).optional(),
    content: z.string().min(10).max(2000).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'حداقل یک فیلد برای بروزرسانی الزامی است',
  });

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
