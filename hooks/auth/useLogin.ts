// hooks/auth/useLogin.ts
'use client';

import { authClient } from '@/lib/auth-client';
type LoginPayload = { email: string; password: string };
export async function loginUser(payload: LoginPayload) {
  const { error, data } = await authClient.signIn.email({
    ...payload,
    callbackURL: '/dashboard',
    rememberMe: true,
  });
  if (error) throw new Error(error.message);
  return data;
}
