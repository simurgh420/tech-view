// app/services/actions/user/logout.ts
'use server';

import { auth } from '@/lib/auth';
import { APIError } from 'better-auth';
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
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.message };
    }
    return { error: 'خطای داخلی سرور' };
  }
}
