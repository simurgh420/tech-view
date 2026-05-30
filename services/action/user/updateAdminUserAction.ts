'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';

export async function updateAdminUserAction(
  userId: string,
  data: { name?: string; email?: string }
) {
  const headersList = await headers();

  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: لطفاً وارد شوید' };
  }

  const permissionCheck = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session.user.id,
      permission: { user: ['set-role'] },
    },
  });

  if (permissionCheck.error) {
    console.error('Permission check error:', permissionCheck.error);
    return { success: false, error: 'خطا در بررسی دسترسی' };
  }

  if (!permissionCheck.success) {
    return { success: false, error: 'Forbidden: شما اجازه ویرایش کاربران را ندارید' };
  }

  try {
    await auth.api.adminUpdateUser({
      headers: headersList,
      body: { userId, data },
    });

    return { success: true, error: null };
  } catch (err) {
    if (err instanceof APIError) {
      // مدیریت خطاهای خاص Better Auth
      if (err.status === 404) {
        return { success: false, error: 'کاربر مورد نظر یافت نشد' };
      }
      if (err.status === 403) {
        return { success: false, error: 'شما مجوز این کار را ندارید' };
      }
      if (err.status === 400) {
        return { success: false, error: 'اطلاعات ارسالی نامعتبر است (مثلاً ایمیل تکراری)' };
      }
      return { success: false, error: err.message };
    }

    console.error('Update admin user error:', err);
    return { success: false, error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید' };
  }
}
