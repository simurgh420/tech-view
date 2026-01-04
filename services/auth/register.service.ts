// services/auth/register.service.ts
import { signUp } from '@/lib/auth-client';
// سمت کلاینت
export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export async function registerService(input: RegisterInput) {
  const { data, error } = await signUp.email({
    email: input.email,
    password: input.password,
    name: input.name,
  });

  if (error) {
    throw new Error(error.message ?? 'خطا در ثبت‌نام');
  }

  if (!data) {
    throw new Error('پاسخ نامعتبر از سرور');
  }

  return data;
}
