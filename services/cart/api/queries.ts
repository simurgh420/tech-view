// services/cart/api/queries.ts

import { CartItem } from '@/app/generated/prisma/client';
import axios from 'axios';

export async function fetchCartApi(): Promise<CartItem[]> {
  const res = await axios.get<CartItem[]>('/api/cart');
  return res.data;
}
