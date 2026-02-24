// services/auth/register.service.ts
import { signUp } from '@/lib/auth-client';
import { RegisterInput, RegisterSchema } from '@/lib/validation/auth';
import { APIError } from 'better-auth';
// سمت کلاینت

export async function registerService(input: RegisterInput) {
  const parsed = RegisterSchema.parse(input);
  try {
    const { data, error } = await signUp.email({
      email: parsed.email,
      password: parsed.password,
      name: parsed.name,
    });

    if (error) {
      throw new Error(error.message ?? 'خطا در ثبت‌نام');
    }

    if (!data) {
      throw new Error('پاسخ نامعتبر از سرور');
    }

    return data;
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }

    return { success: false, error: 'خطای داخلی سرور' };
  }
}
