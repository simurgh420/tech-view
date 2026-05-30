import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(3, 'نام باید حداقل ۳ کاراکتر باشد'),
  email: z.email('ایمیل معتبر نیست'),
  phone: z.string().min(10, 'شماره تماس معتبر نیست'),
  subject: z.string().min(3, 'موضوع پیام خیلی کوتاه است'),
  message: z.string().min(10, 'متن پیام باید حداقل ۱۰ کاراکتر باشد'),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
