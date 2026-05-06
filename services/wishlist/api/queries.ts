// services/wishlist/api/queries.ts

import { WishlistItem } from '@/app/generated/prisma/client';
import axios from 'axios';

export async function fetchWishlistApi(): Promise<WishlistItem[]> {
  const res = await axios.get('/api/wishlist');
  return res.data;
}
