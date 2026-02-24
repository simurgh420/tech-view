//services/auth/login.service.ts
import { signIn } from '@/lib/auth-client';
import { LoginInput, LoginSchema } from '@/lib/validation/auth';
import { APIError } from 'better-auth';

// سمت کلاینت
export async function loginService(input: LoginInput) {
  const parsed = LoginSchema.parse(input);
  try {
    const { data, error } = await signIn.email({
      email: parsed.email,
      password: parsed.password,
      rememberMe: true,
    });

    if (error) {
      throw new Error(error.message ?? 'ورود ناموفق بود');
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
