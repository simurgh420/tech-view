// hooks/auth/useRegister.ts
'use client';

import { authClient } from '@/lib/auth-client';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(payload: RegisterPayload) {
  try {
    const { error, data } = await authClient.signUp.email({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      callbackURL: '/dashboard',
    });

    if (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'خطا در ثبت‌نام');
    }

    if (!data) {
      throw new Error('پاسخ نامعتبر از سرور');
    }

    return data;
  } catch (err) {
    console.error('Registration failed:', err);
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('خطای نامشخص در ثبت‌نام');
  }
}
