'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

import { resetPassword } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
// ✅ اعتبارسنجی با Zod
const schema = z
  .object({
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    confirmPassword: z.string().min(6, 'تکرار رمز عبور باید حداقل ۶ کاراکتر باشد'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  });
type FormValues = z.infer<typeof schema>;
interface ResetPasswordFormProps {
  token: string;
}
export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);

    await resetPassword({
      newPassword: values.password,
      token,
      fetchOptions: {
        onSuccess: () => {
          toast.success('Password reset successfully.');
          router.push('/auth/login');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (ctx: any) => {
          toast.error(ctx.error.message || 'خطا در تغییر رمز عبور');
        },
        onResponse: () => setIsPending(false),
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-sm w-full space-y-6  p-6 rounded-xl shadow-sm border"
      >
        <h2 className="text-xl font-semibold 0"> تغییر رمز عبور</h2>
        <p className="text-sm ">رمز عبور جدید خود را وارد کنید.</p>

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="password">رمز عبور جدید</Label>
              <FormControl>
                <Input
                  type="password"
                  id="password"
                  placeholder="رمز عبور جدید را وارد کنید"
                  className="text-right"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm Password */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
              <FormControl>
                <Input
                  type="password"
                  id="confirmPassword"
                  placeholder="رمز عبور جدید را دوباره وارد کنید"
                  className="text-right"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'در حال تغییر...' : 'تغییر رمز عبور'}
        </Button>
      </form>
    </Form>
  );
};
