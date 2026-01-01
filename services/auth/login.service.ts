//services/auth/login.service.ts
import { signIn } from '@/lib/auth-client';

export type LoginInput = {
  email: string;
  password: string;
};

export async function loginService(input: LoginInput) {
  const { data, error } = await signIn.email({
    email: input.email,
    password: input.password,
    rememberMe: true,
  });

  if (error) {
    throw new Error(error.message ?? 'ورود ناموفق بود');
  }

  if (!data) {
    throw new Error('پاسخ نامعتبر از سرور');
  }

  return data;
}
