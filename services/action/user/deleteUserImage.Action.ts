'use server';

import { deleteImage } from '@/services/upload/deleteImage';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { APIError } from 'better-auth';

export async function deleteUserImageAction(imageUrl: string) {
  try {
    const imagePath = new URL(imageUrl, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
      .pathname;

    // حذف فایل از سرور
    await deleteImage(imagePath);

    // گرفتن سشن کاربر فعلی
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // آپدیت پروفایل کاربر
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: session.user.name ?? '',
        image: null,
      },
    });

    return { success: true, error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }

    return { success: false, error: 'خطای داخلی سرور' };
  }
}
