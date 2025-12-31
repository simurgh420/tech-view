'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useRegister } from '@/hooks/auth/useRegister';
import { useNotify } from '@/hooks/useNotify';

/* ---------------------------------------------
 *  Schema (Validation Layer)
 * --------------------------------------------- */
export const RegisterSchema = z.object({
  name: z.string().trim().min(1, 'نام الزامی است').max(100),
  email: z.string().email('ایمیل معتبر نیست').trim(),
  password: z.string().min(8, 'رمز عبور حداقل ۸ کاراکتر باشد').max(128),
});

/* ---------------------------------------------
 *  Component
 * --------------------------------------------- */
export function RegisterForm() {
  const router = useRouter();
  const notify = useNotify();
  const registerMutation = useRegister();

  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onSubmit',
  });

  /* ---------------------------------------------
   *  Submit Handler
   * --------------------------------------------- */
  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setGlobalError(null);

    registerMutation.mutate(values, {
      onSuccess: () => {
        notify.success('ثبت‌نام با موفقیت انجام شد', 'در حال انتقال به داشبورد...');
        router.push('/admin/dashboard');
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        const message = err?.message ?? 'ثبت‌نام ناموفق بود';
        setGlobalError(message);
        notify.error('خطا در ثبت‌نام', message);
      },
    });
  };

  /* ---------------------------------------------
   *  UI
   * --------------------------------------------- */
  return (
    <div className="w-full max-w-md mx-auto p-8 border rounded-2xl shadow-lg bg-white/90 backdrop-blur-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">ایجاد حساب کاربری</h2>

      {/* Global Error */}
      {globalError && (
        <div className="mb-6 text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
          {globalError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام</FormLabel>
                <FormControl>
                  <Input placeholder="نام شما" {...field} className="h-11 text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ایمیل</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@gmail.com"
                    {...field}
                    className="h-11 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رمز عبور</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    {...field}
                    className="h-11 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'در حال ثبت‌نام...' : 'ثبت نام'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
