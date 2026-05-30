'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

import { useRouter } from 'next/navigation';
import { requestPasswordResetAction } from '@/services/action/user/requestPasswordResetAction';
import { useNotify } from '@/hooks/useNotify';

const schema = z.object({
  email: z.email('لطفاً یک ایمیل معتبر وارد کنید'),
});

type FormValues = z.infer<typeof schema>;

export const ForgotPasswordForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const notify = useNotify();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    const { error } = await requestPasswordResetAction({
      email: values.email,
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      notify.error(error);
    } else {
      notify.success('لینک بازیابی رمز عبور به ایمیل شما ارسال شد.');
      router.push('/auth/forgot-password/success');
    }
  }

  return (
    <div className=" flex  justify-center p-6" dir="rtl">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-sm w-full space-y-6 p-6 rounded-xl shadow-md border dark:border-neutral-700 "
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="email">ایمیل</Label>
                <FormControl>
                  <Input id="email" type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}
          </Button>
        </form>
      </Form>
    </div>
  );
};
