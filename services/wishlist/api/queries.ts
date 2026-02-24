// services/wishlist/api/queries.ts

import { WishlistItem } from '@/app/generated/prisma/client';
import axios from 'axios';

export async function fetchWishlistApi(userId: string): Promise<WishlistItem[]> {
  const res = await axios.get(`/api/wishlist?userId=${userId}`);
  return res.data;
}
