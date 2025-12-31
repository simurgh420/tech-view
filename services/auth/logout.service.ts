// services/auth/logout.service.ts
'use client';

import { authClient } from '@/lib/auth-client';

export async function logoutService() {
  const { error } = await authClient.signOut({});

  if (error) {
    throw new Error(error.message ?? 'خطا در خروج از حساب');
  }

  return true;
}
