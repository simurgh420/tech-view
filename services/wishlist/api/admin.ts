// services/wishlist/api/admin.ts
import axios from 'axios';
import { AdminWishlistItem } from '@/types/wishlist';

// دریافت همه آیتم‌های ویش‌لیست برای ادمین
export async function fetchAdminWishlistApi(): Promise<AdminWishlistItem[]> {
  const { data } = await axios.get('/api/wishlist/admin');
  return data;
}
// خالی کردن ویش‌لیست یک کاربر (ادمین)
export async function clearUserWishlistApi(userId: string): Promise<{ success: boolean }> {
  const { data } = await axios.delete('/api/wishlist/admin/clear', {
    params: { userId },
  });
  return data;
}
