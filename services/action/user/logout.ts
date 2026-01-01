// app/services/actions/user/logout.ts
'use server';

import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  const headersList = await headers();

  try {
    // فراخوانی API خروج BetterAuth
    await auth.api.signOut({ headers: headersList });

    // بعد از خروج، کاربر رو به صفحه ورود هدایت کن
    revalidatePath('/');
    redirect('/auth/login');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'خطا در خروج از حساب' };
  }
}
