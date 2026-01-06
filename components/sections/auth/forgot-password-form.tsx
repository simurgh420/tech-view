'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

import { requestPasswordReset } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

export const ForgotPasswordForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);

    await requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/auth/reset-password`,
      fetchOptions: {
        onSuccess: () => {
          toast.success('Reset link sent to your email.');
          router.push('/auth/forgot-password/success');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (ctx: any) => {
          toast.error(ctx.error.message);
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
        <h2 className="text-xl font-semibold text-gray-900">Forgot Password</h2>
        <p className="text-sm text-gray-500">
          Enter your email and we’ll send you a link to reset your password.
        </p>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="email">Email</Label>
              <FormControl>
                <Input id="email" type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
    </Form>
  );
};
