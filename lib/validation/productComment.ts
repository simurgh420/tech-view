// lib/validation/productComment.ts
import { z } from 'zod';

export const createProductCommentSchema = z.object({
  productSlug: z.string().min(1, 'شناسه محصول الزامی است'),
  content: z
    .string()
    .trim()
    .min(2, 'متن کامنت حداقل ۲ کاراکتر')
    .max(1000, 'متن کامنت حداکثر ۱۰۰۰ کاراکتر'),
  parentId: z.string().cuid().optional(),
});

export const updateProductCommentSchema = z
  .object({
    content: z.string().trim().min(2).max(1000).optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'حداقل یک فیلد برای بروزرسانی الزامی است',
  });

export type CreateProductCommentInput = z.infer<typeof createProductCommentSchema>;
export type UpdateProductCommentInput = z.infer<typeof updateProductCommentSchema>;
