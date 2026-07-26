'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutPayloadType } from '@/lib/validation/checkout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui';
import { useNotify } from '@/hooks/useNotify';
import { useRouter } from 'next/navigation';
import { User, MapPin, Loader2 } from 'lucide-react';
import { useCreateOrder } from '@/hooks/useOrders';

type CheckoutFormProps = {
  defaultValues: CheckoutPayloadType;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500 dark:text-red-400">{message}</p>;
}

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
        <Icon size={15} />
      </span>
      {title}
    </div>
  );
}

export function CheckoutForm({ defaultValues }: CheckoutFormProps) {
  const notify = useNotify();
  const router = useRouter();
  const createOrder = useCreateOrder();

  const form = useForm<CheckoutPayloadType>({
    resolver: zodResolver(checkoutSchema),
    defaultValues,
  });

  const onSubmit = (data: CheckoutPayloadType) => {
    createOrder.mutate(data, {
      onSuccess: res => {
        notify.success('سفارش با موفقیت ثبت شد');
        router.push(`/checkout/success?orderId=${res.orderId}`);
      },
      onError: () => {
        notify.error('خطا در ثبت سفارش');
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-8 text-start">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">تکمیل اطلاعات سفارش</h1>

      {/* اطلاعات تماس */}
      <div className="space-y-4 rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
        <SectionHeading icon={User} title="اطلاعات تماس" />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Input {...form.register('fullName')} placeholder="نام و نام خانوادگی" />
            <FieldError message={form.formState.errors.fullName?.message} />
          </div>

          <div>
            <Input
              {...form.register('phone')}
              placeholder="شماره موبایل"
              dir="ltr"
              className="text-end"
            />
            <FieldError message={form.formState.errors.phone?.message} />
          </div>
        </div>
      </div>

      {/* اطلاعات ارسال */}
      <div className="space-y-4 rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
        <SectionHeading icon={MapPin} title="اطلاعات ارسال" />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Input {...form.register('city')} placeholder="شهر" />
            <FieldError message={form.formState.errors.city?.message} />
          </div>

          <div>
            <Input
              {...form.register('postalCode')}
              placeholder="کد پستی"
              dir="ltr"
              className="text-end"
            />
            <FieldError message={form.formState.errors.postalCode?.message} />
          </div>
        </div>

        <div>
          <Textarea {...form.register('address')} placeholder="آدرس کامل" rows={3} />
          <FieldError message={form.formState.errors.address?.message} />
        </div>
      </div>

      <Button
        type="submit"
        disabled={createOrder.isPending}
        className="w-full gap-2 bg-linear-to-l from-red-500 to-rose-600 py-3 text-base font-semibold shadow-md shadow-red-500/25 transition-all hover:shadow-lg hover:shadow-red-500/40 disabled:opacity-60"
      >
        {createOrder.isPending && <Loader2 size={16} className="animate-spin" />}
        {createOrder.isPending ? 'در حال ثبت سفارش...' : 'ثبت سفارش'}
      </Button>
    </form>
  );
}
