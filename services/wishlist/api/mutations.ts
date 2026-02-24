// services/wishlist/api/mutations.ts

import axios from 'axios';
import { WishlistPayload } from '@/types/wishlist';

// اضافه کردن به لیست علاقه‌مندی‌ها
export async function addWishlistItemApi(payload: WishlistPayload) {
  const res = await axios.post('/api/wishlist', payload);
  return res.data;
}

// حذف بر اساس wishlistItem.id
export async function deleteWishlistItemApi(id: string) {
  const res = await axios.delete(`/api/wishlist/${id}`);
  return res.data;
}

// حذف بر اساس userId + productId (برای toggle)
export async function deleteWishlistItemByUserAndProductApi(payload: WishlistPayload) {
  const res = await axios.request({
    url: '/api/wishlist',
    method: 'DELETE',
    data: payload,
  });
  return res.data;
}
