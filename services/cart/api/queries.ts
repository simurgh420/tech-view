// services/cart/api/queries.ts

import { CartItem } from '@/types/cart';
import axios from 'axios';

export async function fetchCart(userId: string) {
  const res = await axios.get(`/api/cart?user=${userId}`);
  return res.data;
}

export async function fetchCartItems(id: string): Promise<CartItem[]> {
  const res = await axios.get(`/api/cart?cartId=${id}`);
  return res.data;
}
