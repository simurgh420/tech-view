// services/cart/api/queries.ts

import { CartItemWithProduct } from '@/features/cart/types/cart';
import axios from 'axios';

export async function fetchCartApi(): Promise<CartItemWithProduct[]> {
  const res = await axios.get<CartItemWithProduct[]>('/api/cart');
  return res.data;
}
