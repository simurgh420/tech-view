import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().optional().default(1),
});

export const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;
