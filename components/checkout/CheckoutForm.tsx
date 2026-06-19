'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutPayloadType } from '@/lib/validation/checkout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui';
import { useNotify } from '@/hooks/useNotify';
import { useOrders } from '@/hooks/useOrders';
import { useRouter } from 'next/navigation';

type CheckoutFormProps = {
  defaultValues: CheckoutPayloadType;
};

export function CheckoutForm({ defaultValues }: CheckoutFormProps) {
  const notify = useNotify();
  const router = useRouter();
  const { useCreateOrder } = useOrders();
  const createOrder = useCreateOrder();

  const form = useForm<CheckoutPayloadType>({
    resolver: zodResolver(checkoutSchema),
    defaultValues,
  });

  const onSubmit = (data: CheckoutPayloadType) => {
    notify.info('در حال ثبت سفارش…');

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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <h1 className="text-xl font-semibold">تکمیل اطلاعات سفارش</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Input {...form.register('fullName')} placeholder="نام و نام خانوادگی" />
          {form.formState.errors.fullName && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.fullName.message}</p>
          )}
        </div>

        <div>
          <Input {...form.register('phone')} placeholder="شماره موبایل" />
          {form.formState.errors.phone && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Input {...form.register('city')} placeholder="شهر" />
          {form.formState.errors.city && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.city.message}</p>
          )}
        </div>

        <div>
          <Input {...form.register('postalCode')} placeholder="کد پستی" />
          {form.formState.errors.postalCode && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.postalCode.message}</p>
          )}
        </div>
      </div>

      <div>
        <Textarea {...form.register('address')} placeholder="آدرس کامل" rows={3} />
        {form.formState.errors.address && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.address.message}</p>
        )}
      </div>

      <Button className="w-full py-3">ثبت سفارش</Button>
    </form>
  );
}
