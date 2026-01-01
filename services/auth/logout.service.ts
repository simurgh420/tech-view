// services/auth/logout.service.ts

import { signOut } from '@/lib/auth-client';

export async function logoutService() {
  const { error } = await signOut({});

  if (error) {
    throw new Error(error.message ?? 'خطا در خروج از حساب');
  }

  return true;
}
