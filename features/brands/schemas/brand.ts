import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(2, 'نام برند الزامی است').max(100),
  logo: z
    .url('آدرس لوگو معتبر نیست')
    .or(z.literal(''))
    .optional()
    .transform(v => (v === '' ? undefined : v)),
  isActive: z.boolean().optional().default(true),
});

export const editBrandSchema = z.object({
  name: z.string().min(2, 'نام برند الزامی است').max(100).optional(),
  logo: z.url('آدرس لوگو معتبر نیست').or(z.literal('')).nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof editBrandSchema>;
