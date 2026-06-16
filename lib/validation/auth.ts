import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().trim().min(1, 'نام الزامی است').max(100),
  email: z.email('ایمیل معتبر نیست').trim(),
  password: z
    .string()
    .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد')
    .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
    .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || /^09\d{9}$/.test(val), 'شماره موبایل معتبر نیست'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.email('ایمیل معتبر نیست').trim(),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});
export type LoginInput = z.infer<typeof LoginSchema>;
