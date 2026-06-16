import { z } from 'zod';

export const checkoutSchema = z.object({
  fullName: z.string().min(3, 'نام معتبر نیست'),
  phone: z.string().min(11, 'شماره موبایل معتبر نیست'),
  city: z.string().min(2, 'شهر معتبر نیست'),
  postalCode: z.string().min(5, 'کد پستی معتبر نیست'),
  address: z.string().min(10, 'آدرس باید کامل باشد'),
});

export type CheckoutPayloadType = z.infer<typeof checkoutSchema>;
