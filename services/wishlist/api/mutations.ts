// services/wishlist/api/mutations.ts

import axios from 'axios';
import { WishlistItemInput } from '@/lib/validation/wishlist';
import { WishlistItem } from '@/app/generated/prisma/client';

// اضافه کردن به لیست علاقه‌مندی‌ها
export async function addWishlistItemApi(payload: WishlistItemInput): Promise<WishlistItem> {
  const res = await axios.post('/api/wishlist', payload);
  return res.data;
}

// حذف بر اساس wishlistItem.id
export async function deleteWishlistItemApi(id: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/wishlist/${id}`);
  return res.data;
}

// حذف بر اساس userId + productId (برای toggle)
export async function deleteWishlistItemByUserAndProductApi(
  productId: string
): Promise<{ success: boolean }> {
  const res = await axios.delete('/api/wishlist', { data: { productId } });
  return res.data;
}
