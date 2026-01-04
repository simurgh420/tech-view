'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth/api';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function deleteUserAction(userId: string) {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) throw new Error('Unauthorized');

  // ❌ جلوگیری از حذف خود کاربر
  if (session.user.id === userId) {
    throw new Error('Forbidden: You cannot delete yourself');
  }

  // 🔥 چک کردن دسترسی واقعی با Access Control
  const permissionCheck = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session.user.id,
      permissions: {
        user: ['delete'],
      },
    },
  });

  if (permissionCheck.error) {
    throw new Error('Forbidden: شما اجازه حذف کاربر را ندارید');
  }

  try {
    await auth.api.removeUser({
      headers: headersList,
      body: { userId },
    });

    revalidatePath('/dashboard/admin');

    return { success: true, error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }

    return { success: false, error: 'خطای داخلی سرور' };
  }
}
