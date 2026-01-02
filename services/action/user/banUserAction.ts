'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function banUserAction(userId: string, reason: string, expiresIn: number | null) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  if (session.user.role !== 'ADMIN') {
    return { success: false, error: 'Forbidden: فقط ادمین اجازه دارد' };
  }
  try {
    await auth.api.banUser({
      headers: headersList,
      body: {
        userId,
        banReason: reason,
        banExpiresIn: expiresIn ?? 0, // 0 یعنی همیشگی
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: 'خطا در بن کردن کاربر' };
  }
}
