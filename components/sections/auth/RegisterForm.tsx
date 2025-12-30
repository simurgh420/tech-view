'use client';

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
import { RegisterSchema } from '@/services/auth/utils/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useNotify } from '@/hooks/useNotify';

export function RegisterForm() {
  const router = useRouter();
  const notify = useNotify();
  const registerMutation = useRegister();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof RegisterSchema>) {
    try {
      const result = await registerMutation.mutateAsync(values);
      console.log('result', result);
      notify.success('ثبت‌نام با موفقیت انجام شد', 'در حال انتقال به صفحه اصلی...');
      setTimeout(() => {
        router.push('/');
      }, 1500);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      form.setError('email', { message: err?.response?.data?.error || 'Registration failed' });
      notify.error('خطا در ثبت‌نام', err?.response?.data?.error);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 border rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm transition-all">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">ایجاد حساب کاربری</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">نام</FormLabel>
                <FormControl>
                  <Input placeholder="نام شما" {...field} className="h-11 text-base" />
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
                <FormLabel className="text-gray-700">ایمیل</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example@gmail.com"
                    type="email"
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
                <FormLabel className="text-gray-700">رمز عبور</FormLabel>
                <FormControl>
                  <Input
                    placeholder="********"
                    type="password"
                    {...field}
                    className="h-11 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
