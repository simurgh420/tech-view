// services/cart/api/mutations.ts

import { CartItem } from '@/app/generated/prisma/client';
import { AddCartItemInput, UpdateQuantityInput } from '@/lib/validation/cart';
import axios from 'axios';

// افزودن محصول به سبد
export async function addCartItemApi(payload: AddCartItemInput): Promise<CartItem> {
  const res = await axios.post('/api/cart', payload);
  return res.data;
}
// به‌روزرسانی تعداد یک آیتم

export async function updateCartItemQuantityApi(id: string, quantity: number): Promise<CartItem> {
  const res = await axios.patch<CartItem>(`/api/cart/${id}`, {
    quantity,
  } satisfies UpdateQuantityInput);
  return res.data;
}
// حذف یک آیتم
export async function removeCartItemApi(id: string): Promise<{ success: boolean }> {
  const res = await axios.delete<{ success: boolean }>(`/api/cart/${id}`);
  return res.data;
}

// پاک کردن کل سبد (بدون پارامتر؛ کاربر از روی سشن تشخیص داده می‌شود)
export async function clearCartApi(): Promise<{ success: boolean }> {
  const res = await axios.delete<{ success: boolean }>('/api/cart');
  return res.data;
}
