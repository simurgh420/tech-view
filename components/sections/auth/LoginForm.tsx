'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import Link from 'next/link';
import { LoginSchema, LoginInput } from '@/lib/validation/auth';
import { loginAction } from '@/services/action/user/login';

export function LoginForm() {
  const router = useRouter();
  const notify = useNotify();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  async function onSubmit(values: LoginInput) {
    setGlobalError(null);
    setLoading(true);

    const { error } = await loginAction(values);

    if (error) {
      setGlobalError(error);
      notify.error('ورود ناموفق', error);
    } else {
      notify.success('ورود موفقیت‌آمیز بود', 'در حال انتقال به داشبورد...');
      router.push('/admin/dashboard');
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 border rounded-2xl shadow-lg backdrop-blur-md">
      {globalError && (
        <div className="mb-6 text-red-600 text-sm  border  p-3 rounded-lg">{globalError}</div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>رمز عبور</FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    tabIndex={-1}
                    className="text-sm italic text-muted-foreground hover:text-foreground transition-colors"
                  >
                    فراموش کردید؟
                  </Link>
                </div>
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

          <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
            {loading ? 'در حال ورود...' : 'ورود'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
