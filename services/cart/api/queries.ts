// services/cart/api/queries.ts

import { CartItem } from '@/app/generated/prisma/client';
import axios from 'axios';

export async function fetchCartApi(userId: string) {
  const res = await axios.get(`/api/cart?userId=${userId}`);
  return res.data;
}

export async function fetchCartItemsApi(cartId: string): Promise<CartItem[]> {
  const res = await axios.get(`/api/cart?cartId=${cartId}`);
  return res.data;
}
