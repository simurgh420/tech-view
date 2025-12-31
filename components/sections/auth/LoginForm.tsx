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
import { useNotify } from '@/hooks/useNotify';
import { useLogin } from '@/hooks/auth/useLogin';

/* ---------------------------------------------
 *  Schema (Validation Layer)
 * --------------------------------------------- */
const LoginSchema = z.object({
  email: z.email('ایمیل معتبر نیست'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

/* ---------------------------------------------
 *  Component
 * --------------------------------------------- */
export function LoginForm() {
  const router = useRouter();
  const notify = useNotify();
  const loginMutation = useLogin();

  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  /* ---------------------------------------------
   *  Submit Handler
   * --------------------------------------------- */
  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setGlobalError(null);
    loginMutation.mutate(values, {
      onSuccess: () => {
        notify.success('ورود موفقیت‌آمیز بود', 'در حال انتقال به داشبورد...');
        router.push('/admin/dashboard');
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        const message = err?.message ?? 'ورود ناموفق بود';
        setGlobalError(message);
        notify.error('ورود ناموفق', message);
      },
    });
  };

  /* ---------------------------------------------
   *  UI
   * --------------------------------------------- */
  return (
    <div className="w-full max-w-md mx-auto p-8 border rounded-2xl shadow-lg bg-white/90 backdrop-blur-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">ورود به حساب</h2>

      {/* Global Error */}
      {globalError && (
        <div className="mb-6 text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
          {globalError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'در حال ورود...' : 'ورود'}
          </Button>
        </form>
      </Form>

      {/* Footer Link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Don’t have an account?{' '}
        <a
          href="/register"
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Create one
        </a>
      </p>
    </div>
  );
}
