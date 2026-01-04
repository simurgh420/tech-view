// services/wishlist/api/queries.ts

import { WishlistItem } from '@/types/wishlist';
import axios from 'axios';

export async function fetchWishlist(userId: string): Promise<WishlistItem[]> {
  const res = await axios.get(`/api/wishlist?userId=${userId}`);
  return res.data;
}
