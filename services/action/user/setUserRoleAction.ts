'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';

export async function setUserRoleAction(userId: string, role: 'USER' | 'ADMIN') {
  const headersList = await headers();

  // گرفتن سشن
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) return { success: false, error: 'Unauthorized' };

  // فقط ادمین اجازه تغییر رول دارد
  if (session.user.role !== 'ADMIN') {
    return { success: false, error: 'Forbidden: فقط ادمین اجازه دارد' };
  }

  try {
    await auth.api.setRole({
      headers: headersList,
      body: {
        userId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: role as any,
      },
    });
    return { success: true };
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.message };
    }
    return { error: 'خطای داخلی سرور' };
  }
}
