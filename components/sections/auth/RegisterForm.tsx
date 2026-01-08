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
    defaultValues: { name: '', email: '', password: '' },
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
      router.push('/register/success');
    }
    setLoading(false);
  }

  return (
    <div
      className="
        w-full max-w-md mx-auto p-8 
        rounded-2xl shadow-xl 
        backdrop-blur-xl 
        bg-white/80 dark:bg-white/10 
        dark:border dark:border-white/20
        transition-all
      "
      dir="rtl"
    >
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
                <FormLabel className="text-white">نام</FormLabel>
                <FormControl>
                  <Input
                    placeholder="نام شما"
                    {...field}
                    className=" h-11 text-base bg-white/90 dark:bg-white/10 dark:text-white border border-gray-400 dark:border-white/30 focus-visible:ring-2 focus-visible:ring-blue-500 "
                  />
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
                <FormLabel className="text-white">ایمیل</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@gmail.com"
                    {...field}
                    className=" h-11 text-base bg-white/90 dark:bg-white/10 dark:text-white border border-gray-400 dark:border-white/30 focus-visible:ring-2 focus-visible:ring-blue-500 "
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
                <FormLabel className="text-white">رمز عبور</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    {...field}
                    className=" h-11 text-base bg-white/90 dark:bg-white/10 dark:text-white border border-gray-400 dark:border-white/30 focus-visible:ring-2 focus-visible:ring-blue-500 "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
            {loading ? 'در حال ثبت‌نام...' : 'ثبت نام'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
