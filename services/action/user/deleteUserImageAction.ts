'use server';

import { deleteImage } from '@/services/upload/deleteImage';
import { auth } from '@/lib/auth';
import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';

export async function deleteUserImageAction(imageUrl: string) {
  // 1. اعتبارسنجی اولیه
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { success: false, error: 'آدرس تصویر معتبر نیست' };
  }

  const headersList = await headers();

  // 2. گرفتن سشن کاربر (بدون try-catch جدا)
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: لطفاً وارد شوید' };
  }

  // 3. بررسی اینکه کاربر تصویر دارد
  const currentUserImage = session.user.image;
  if (!currentUserImage) {
    return { success: false, error: 'شما هیچ تصویری برای حذف ندارید' };
  }

  // 4. تطابق آدرس تصویر ورودی با تصویر فعلی کاربر
  if (currentUserImage !== imageUrl) {
    return { success: false, error: 'تصویر مورد نظر متعلق به شما نیست' };
  }

  // 5. استخراج مسیر فایل از URL (با مدیریت خطا)
  let imagePath: string;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    imagePath = new URL(imageUrl, baseUrl).pathname;
  } catch {
    return { success: false, error: 'آدرس تصویر نامعتبر است' };
  }

  // 6. عملیات اصلی (حذف فایل و به‌روزرسانی کاربر)
  try {
    // حذف فایل فیزیکی
    await deleteImage(imagePath);

    // به‌روزرسانی پروفایل کاربر (حذف فیلد image)
    await auth.api.updateUser({
      headers: headersList,
      body: {
        image: null,
      },
    });

    return { success: true, error: null };
  } catch (err) {
    // مدیریت خطاهای Better Auth
    if (err instanceof APIError) {
      // خطاهای خاص
      if (err.status === 401) {
        return { success: false, error: 'نشست شما منقضی شده است. دوباره وارد شوید' };
      }
      return { success: false, error: err.message };
    }

    // خطای حذف فایل یا سایر خطاهای ناشناخته
    console.error('Delete user image error:', err);
    return { success: false, error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید' };
  }
}
