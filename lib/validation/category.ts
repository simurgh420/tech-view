import { z } from 'zod';

export const createCategorySchema = z.object({
  title: z.string().min(2, 'عنوان کتگوری باید حداقل ۲ کاراکتر باشد').max(100),
  icon: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export const editCategorySchema = z.object({
  title: z.string().min(2).max(100).optional(),
  icon: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type EditCategoryInput = z.infer<typeof editCategorySchema>;
