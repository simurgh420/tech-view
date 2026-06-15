// services/cart/api/queries.ts

import { CartItemWithProduct } from '@/types/cart';
import axios from 'axios';

export async function fetchCartApi(): Promise<CartItemWithProduct[]> {
  const res = await axios.get<CartItemWithProduct[]>('/api/cart');
  return res.data;
}
