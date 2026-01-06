'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { changePasswordAction } from '@/services/action/user/change-password.action';
import { toast } from 'sonner';

// ✅ ولیدیشن قوی‌تر
const schema = z
  .object({
    currentPassword: z.string().min(8, 'رمز عبور فعلی باید حداقل ۸ کاراکتر باشد'),
    newPassword: z
      .string()
      .min(8, 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد')
      .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
      .regex(/[a-z]/, 'رمز عبور باید حداقل یک حرف کوچک داشته باشد')
      .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد')
      .regex(/[^A-Za-z0-9]/, 'رمز عبور باید حداقل یک کاراکتر خاص داشته باشد'),
    confirmPassword: z.string().min(8, 'تکرار رمز عبور باید حداقل ۸ کاراکتر باشد'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'رمزهای عبور یکسان نیستند',
    path: ['confirmPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'رمز جدید نباید همان رمز فعلی باشد',
    path: ['newPassword'],
  });

type FormValues = z.infer<typeof schema>;

export const ChangePasswordForm = () => {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);

    const formData = new FormData();
    formData.append('currentPassword', values.currentPassword);
    formData.append('newPassword', values.newPassword);

    const { error } = await changePasswordAction(formData);

    if (error) {
      toast.error(error);
    } else {
      toast.success('رمز عبور با موفقیت تغییر کرد');
      form.reset();
    }

    setIsPending(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-sm w-full space-y-6  p-6 rounded-xl shadow-sm border"
      >
        <h2 className="text-xl font-semibold text-gray-900">تغییر رمز عبور</h2>
        <p className="text-sm text-gray-500">
          لطفاً رمز عبور فعلی و رمز جدید خود را وارد کنید. رمز جدید باید قوی و امن باشد.
        </p>

        {/* رمز عبور فعلی */}
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="currentPassword">رمز عبور فعلی</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  id="currentPassword"
                  placeholder="رمز عبور فعلی را وارد کنید"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* رمز عبور جدید */}
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="newPassword">رمز عبور جدید</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  id="newPassword"
                  placeholder="رمز عبور جدید را وارد کنید"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* تکرار رمز عبور */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="confirmPassword">تکرار رمز عبور</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  id="confirmPassword"
                  placeholder="رمز عبور جدید را دوباره وارد کنید"
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
