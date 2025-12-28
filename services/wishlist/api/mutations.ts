// services/wishlist/api/mutations.ts

import { WishlistItem, WishlistPayload } from '@/types/wishlist';
import axios from 'axios';

export async function addWishlistItem(payload: WishlistPayload): Promise<WishlistItem> {
  const res = await axios.post('/api/wishlist', payload);
  return res.data;
}
// حذف بر اساس خود WishlistItem.id
export async function deleteWishlistItem(id: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/wishlist/${id}`);
  return res.data;
}

// حذف بر اساس userId + productId (برای دکمه toggle روی کارت محصول)
export async function deleteWishlistItemByUserAndProduct(
  payload: WishlistPayload
): Promise<{ success: boolean }> {
  const res = await axios.request<{ success: boolean }>({
    url: '/api/wishlist',
    method: 'DELETE',
    data: payload,
  });
  return res.data;
}
