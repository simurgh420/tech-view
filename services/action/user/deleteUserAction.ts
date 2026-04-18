'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth/api';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function deleteUserAction(userId: string) {
  if (!userId || typeof userId !== 'string') {
    return { success: false, error: 'شناسه کاربر معتبر نیست' };
  }
  const headersList = await headers();

  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: لطفاً وارد شوید' };
  }

  if (!session) throw new Error('Unauthorized');

  // ❌ جلوگیری از حذف خود کاربر
  if (session.user.id === userId) {
    return { success: false, error: 'Forbidden: نمی‌توانید خودتان را حذف کنید' };
  }

  // 🔥 چک کردن دسترسی واقعی با Access Control
  const permissionCheck = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session.user.id,
      permission: { user: ['delete'] },
    },
  });

  if (permissionCheck.error) {
    console.error('Permission check error:', permissionCheck.error);
    return { success: false, error: 'خطا در بررسی دسترسی' };
  }

  if (!permissionCheck.success) {
    return { success: false, error: 'Forbidden: شما اجازه حذف کاربر را ندارید' };
  }
  try {
    await auth.api.removeUser({
      headers: headersList,
      body: { userId },
    });

    revalidatePath('/dashboard/admin'); // ریفرش صفحه ادمین

    return { success: true, error: null };
  } catch (err) {
    if (err instanceof APIError) {
      // مدیریت خطاهای خاص Better Auth
      if (err.status === 404) {
        return { success: false, error: 'کاربر مورد نظر یافت نشد' };
      }
      return { success: false, error: err.message };
    }

    console.error('Delete user error:', err);
    return { success: false, error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید' };
  }
}
