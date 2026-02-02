// services/cart/api/mutations.ts

import { CartItem } from '@/app/generated/prisma/client';
import { CartItemPayload } from '@/types/cart';
import axios from 'axios';

export async function addCartItemApi(payload: CartItemPayload): Promise<CartItem> {
  const res = await axios.post('/api/cart', payload);
  return res.data;
}

export async function updateCartItemQuantityApi(id: string, quantity: number): Promise<CartItem> {
  const res = await axios.patch(`/api/cart/${id}`, { quantity });
  return res.data;
}
export async function removeCartItemApi(id: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/cart/${id}`);
  return res.data;
}

export async function clearCartApi(cartId: string): Promise<{ success: boolean }> {
  const res = await axios.request<{ success: boolean }>({
    url: '/api/cart',
    method: 'DELETE',
    data: { cartId },
  });
  return res.data;
}
