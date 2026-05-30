'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  const headersList = await headers();

  try {
    await auth.api.signOut({ headers: headersList });
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: 'خطای داخلی سرور' };
  }
  // پاک کردن کش صفحه اصلی (اختیاری)
  revalidatePath('/');

  // هدایت به صفحه ورود (بعد از try-catch)
  redirect('/auth/login');
}
