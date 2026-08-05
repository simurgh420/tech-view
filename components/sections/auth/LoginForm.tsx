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
    <div dir="rtl">
      {globalError && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {globalError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-white/70">ایمیل</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@gmail.com"
                    dir="ltr"
                    {...field}
                    className="h-11 border-white/10 bg-white/[0.03] text-base text-white placeholder:text-white/30 focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400/20"
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
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm text-white/70">رمز عبور</FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    tabIndex={-1}
                    className="text-xs text-cyan-400/80 transition-colors hover:text-cyan-300"
                  >
                    فراموش کردید؟
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    dir="ltr"
                    {...field}
                    className="h-11 border-white/10 bg-white/[0.03] text-base text-white placeholder:text-white/30 focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="h-11 w-full bg-cyan-500 text-base font-semibold text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]"
            disabled={loading}
          >
            {loading ? 'در حال ورود...' : 'ورود'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
