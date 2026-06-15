// types/cart.ts

import { CartItem, Product } from '@/app/generated/prisma/client';
import { productSelect } from '@/services/cart/constants';

export interface CartItemPayload {
  productId: string;
  quantity?: number; // default: 1
}

// استخراج کلیدهای productSelect
type ProductSelectKeys = keyof typeof productSelect;

// ساخت نوع Product مطابق select
export type SelectedProduct = Pick<Product, ProductSelectKeys>;

// ساخت نوع CartItemWithProduct
export type CartItemWithProduct = CartItem & {
  product: SelectedProduct;
};
