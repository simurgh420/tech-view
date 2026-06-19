'use server';

import { deleteImage } from '@/services/upload/deleteImage';
import { auth } from '@/lib/auth';
import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

export async function deleteUserImageAction(imageUrl: string) {
  logger.info('DeleteUserImageAction started', { imageUrl });
  // 1. اعتبارسنجی اولیه
  if (!imageUrl || typeof imageUrl !== 'string') {
    logger.warn('Invalid imageUrl provided', { imageUrl });
    return { success: false, error: 'آدرس تصویر معتبر نیست' };
  }

  const headersList = await headers();

  // 2. گرفتن سشن کاربر (بدون try-catch جدا)
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    logger.warn('Unauthorized delete image attempt');
    return { success: false, error: 'Unauthorized: لطفاً وارد شوید' };
  }

  // 3. بررسی اینکه کاربر تصویر دارد
  const currentUserImage = session.user.image;
  if (!currentUserImage) {
    logger.warn('User has no image to delete', { userId: session.user.id });
    return { success: false, error: 'شما هیچ تصویری برای حذف ندارید' };
  }

  // 4. تطابق آدرس تصویر ورودی با تصویر فعلی کاربر
  if (currentUserImage !== imageUrl) {
    logger.warn('Image does not belong to user', {
      userId: session.user.id,
      providedImage: imageUrl,
      actualImage: currentUserImage,
    });
    return { success: false, error: 'تصویر مورد نظر متعلق به شما نیست' };
  }

  // 5. استخراج مسیر فایل از URL (با مدیریت خطا)
  let imagePath: string;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    imagePath = new URL(imageUrl, baseUrl).pathname;
  } catch (err) {
    logger.error('Invalid image URL parsing failed', { imageUrl, error: err });
    return { success: false, error: 'آدرس تصویر نامعتبر است' };
  }

  // 6. عملیات اصلی (حذف فایل و به‌روزرسانی کاربر)
  try {
    // حذف فایل فیزیکی
    await deleteImage(imagePath);
    logger.info('User image file deleted', { userId: session.user.id, imagePath });
    // به‌روزرسانی پروفایل کاربر (حذف فیلد image)
    await auth.api.updateUser({
      headers: headersList,
      body: {
        image: null,
      },
    });
    logger.info('User image field removed from profile', { userId: session.user.id });
    return { success: true, error: null };
  } catch (err) {
    // مدیریت خطاهای Better Auth
    if (err instanceof APIError) {
      logger.error('BetterAuth deleteUserImage error', {
        status: err.status,
        message: err.message,
      });
      // خطاهای خاص
      if (err.status === 401) {
        return { success: false, error: 'نشست شما منقضی شده است. دوباره وارد شوید' };
      }
      return { success: false, error: err.message };
    }

    // خطای حذف فایل یا سایر خطاهای ناشناخته
    logger.error('Unknown deleteUserImage error', { error: err });
    return { success: false, error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید' };
  }
}
