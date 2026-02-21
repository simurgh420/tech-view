import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(1, 'عنوان محصول الزامی است'),
  description: z.string().min(1, 'توضیحات الزامی است'),
  price: z.number().min(1, 'قیمت الزامی است'),
  discountPrice: z.number().nullable().optional(),
  brandSlug: z.string().min(1, 'انتخاب برند الزامی است'),
  categorySlug: z.string().min(1, 'انتخاب دسته‌بندی الزامی است'),
  stockQuantity: z.number().min(0, 'موجودی نمی‌تواند منفی باشد'),

  keyFeatures: z.array(z.string()),
  colors: z
    .array(
      z.object({
        name: z.string().min(1, 'نام رنگ الزامی است'),
        hex: z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'کد رنگ معتبر نیست'),
      })
    )
    .min(1, 'حداقل یک رنگ باید اضافه شود'),
  variants: z.array(
    z.object({
      ram: z.string().min(1, 'رم الزامی است'),
      storage: z.string().min(1, 'حافظه الزامی است'),
    })
  ),
  specifications: z.record(
    z.string(),
    z.array(
      z.object({
        label: z.string().min(1, 'عنوان ویژگی الزامی است'),
        value: z.union([z.string(), z.number()]),
      })
    )
  ),
  thumbnail: z.union([z.instanceof(File), z.string()]).optional(),
  images: z.array(z.union([z.instanceof(File), z.string()])),
});

export type ProductFormValues = z.infer<typeof productSchema>;
