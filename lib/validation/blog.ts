// src/lib/validation/blog.ts
import { z } from 'zod';

// ---------- اسکیما سمت کلاینت (فرم) ----------
export const blogFormSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  excerpt: z.string().min(10, 'خلاصه باید حداقل ۱۰ کاراکتر باشد'),
  coverImageUrl: z.union([z.instanceof(File), z.url()]).optional(),
  content: z.string().min(20, 'محتوا باید حداقل ۲۰ کاراکتر باشد'),
  tags: z.array(z.string().min(2, 'تگ باید حداقل ۲ کاراکتر باشد')),
});
export type BlogFormType = z.infer<typeof blogFormSchema>;

// این تایپ صرفاً برای ارسال از کلاینت به API است (قبل از افزودن slug, authorId, status)
export const createBlogPayloadSchema = z.object({
  title: z.string().min(3, 'عنوان حداقل ۳ کاراکتر باشد'),
  excerpt: z.string().min(10, 'خلاصه حداقل ۱۰ کاراکتر باشد'),
  content: z.string().min(20, 'محتوا حداقل ۲۰ کاراکتر باشد'),
  tags: z.array(z.string().min(2, 'تگ باید حداقل ۲ کاراکتر باشد')),
  coverImageUrl: z.url().optional().nullable(),
});

export type CreateBlogPayload = z.infer<typeof createBlogPayloadSchema>;

// ---------- اسکیمای ایجاد در سرور ----------
export const createBlogSchema = z.object({
  // فیلدهای اصلی (از فرم می‌آیند، اما بعد از آپلود فایل به URL تبدیل می‌شوند)
  title: z.string().min(3, 'عنوان حداقل ۳ کاراکتر').max(200),
  excerpt: z.string().min(10, 'خلاصه حداقل ۱۰ کاراکتر'),
  content: z.string().min(20, 'محتوا حداقل ۲۰ کاراکتر'),
  tags: z.array(z.string().min(2, 'تگ حداقل ۲ کاراکتر')),
  // فیلدهایی که در فرم نیستند و در API ساخته/تکمیل می‌شوند
  authorId: z.string().min(1, 'نویسنده الزامی است'), // از سشن گرفته می‌شود
  coverImageUrl: z.url().nullable().default(null), // بعد از آپلود، URL نهایی
  status: z.enum(['PUBLISHED', 'DRAFT']).default('PUBLISHED'),
  slug: z.string().optional(),
});
export type CreateBlogInput = z.infer<typeof createBlogSchema>;

// ---------- اسکیمای بروزرسانی در سرور ----------
export const updateBlogSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().min(10).optional(),
  content: z.string().min(20).optional(),
  tags: z.array(z.string().min(2)).optional(),
  slug: z.string().min(1).optional(),
  coverImageUrl: z.url().nullable().optional(),
  status: z.enum(['PUBLISHED', 'DRAFT']).optional(),
});
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
