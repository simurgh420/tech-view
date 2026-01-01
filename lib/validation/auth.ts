import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().trim().min(1, 'نام الزامی است').max(100),
  email: z.email('ایمیل معتبر نیست').trim(),
  password: z.string().min(8, 'رمز عبور حداقل ۸ کاراکتر باشد').max(128),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.email('ایمیل معتبر نیست').trim(),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});
export type LoginInput = z.infer<typeof LoginSchema>;
