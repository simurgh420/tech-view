'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';

export async function banUserAction(userId: string, reason: string, expiresIn: number | null) {
  const headersList = await headers();
  // 1. گرفتن سشن جاری
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) {
    return { success: false, error: 'Unauthorized: لطفاً وارد شوید' };
  }

  const permissionCheck = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session?.user.id,
      permission: { user: ['ban'] },
    },
  });

  // اگر خطایی در بررسی رخ داده باشد
  if (permissionCheck.error) {
    return { success: false, error: 'خطا در بررسی دسترسی' };
  }

  // اگر دسترسی وجود نداشته باشد (success === false)
  if (!permissionCheck.success) {
    return { success: false, error: 'Forbidden: شما اجازه بن کردن ندارید' };
  }
  try {
    await auth.api.banUser({
      headers: headersList,
      body: {
        userId,
        banReason: reason,
        banExpiresIn: expiresIn ?? 0, // 0 = دائمی
      },
    });
    return { success: true };
  } catch (err) {
    // 5. مدیریت خطاهای Better Auth
    if (err instanceof APIError) {
      if (err.status === 403) {
        return { success: false, error: 'شما مجوز این کار را ندارید' };
      }
      if (err.status === 404) {
        return { success: false, error: 'کاربر مورد نظر یافت نشد' };
      }
      return { success: false, error: err.message };
    }
    console.error('Ban user unknown error:', err);
    return { success: false, error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید' };
  }
}
