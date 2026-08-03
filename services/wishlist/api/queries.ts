// services/wishlist/api/queries.ts

import { WishlistItemWithProduct } from '@/types/wishlist';
import axios from 'axios';

export async function fetchWishlistApi(): Promise<WishlistItemWithProduct[]> {
  const res = await axios.get('/api/wishlist');
  return res.data;
}
export async function fetchWishlistCheckApi(productId: string): Promise<{ inWishlist: boolean }> {
  const res = await axios.get(`/api/wishlist/check?productId=${productId}`);
  return res.data;
}
