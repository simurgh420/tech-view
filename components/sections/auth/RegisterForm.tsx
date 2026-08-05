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
import { registerAction } from '@/services/action/user/register';
import { RegisterInput, RegisterSchema } from '@/lib/validation/auth';

export function RegisterForm() {
  const router = useRouter();
  const notify = useNotify();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
    mode: 'onSubmit',
  });

  async function onSubmit(values: RegisterInput) {
    setGlobalError(null);
    setLoading(true);
    const { error } = await registerAction(values);
    if (error) {
      setGlobalError(error);
      notify.error('خطا در ثبت‌نام', error);
    } else {
      notify.success('ثبت‌نام با موفقیت انجام شد', 'لطفاً ایمیل خود را تأیید کنید');
      router.push('/auth/register/success');
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-white/70">نام *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="نام شما"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-white/70">ایمیل *</FormLabel>
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-white/70">شماره موبایل</FormLabel>
                <FormControl>
                  <Input
                    placeholder="09123456789"
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
                <FormLabel className="text-sm text-white/70">رمز عبور *</FormLabel>
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
            {loading ? 'در حال ثبت‌نام...' : 'ثبت نام'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
