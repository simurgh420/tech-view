'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function setUserRoleAction(userId: string, role: 'USER' | 'ADMIN') {
  const headersList = await headers();

  // گرفتن سشن
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: لطفاً وارد شوید' };
  }

  // جلوگیری از تغییر نقش خود کاربر
  if (session.user.id === userId) {
    return { success: false, error: 'Forbidden: نمی‌توانید نقش خودتان را تغییر دهید' };
  }

  const permissionCheck = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session.user.id,
      permission: { user: ['set-role'] }, // ✅ مفرد "permission"
    },
  });

  if (permissionCheck.error) {
    console.error('Permission check error:', permissionCheck.error);
    return { success: false, error: 'خطا در بررسی دسترسی' };
  }

  if (!permissionCheck.success) {
    return { success: false, error: 'Forbidden: شما اجازه تغییر نقش کاربران را ندارید' };
  }

  try {
    await auth.api.setRole({
      headers: headersList,
      body: {
        userId,
        role,
      },
    });
    revalidatePath('/dashboard/admin');

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
      return { success: false, error: err.message };
    }

    console.error('Set user role error:', err);
    return { success: false, error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید' };
  }
}
