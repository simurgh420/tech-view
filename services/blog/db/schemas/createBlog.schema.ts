import z from 'zod';

//createBlog.schema.ts
export const createBlogSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  excerpt: z.string().min(10, 'خلاصه باید حداقل ۱۰ کاراکتر باشد'),
  coverImageUrl: z.string().optional(),
  content: z.string().min(20, 'محتوا باید حداقل ۲۰ کاراکتر باشد'),
  author: z.string().min(3, 'نام نویسنده باید حداقل ۳ کاراکتر باشد'),
  tags: z.array(z.string().min(2, 'تگ باید حداقل ۲ کاراکتر باشد')),
});
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
