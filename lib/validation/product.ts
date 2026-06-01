import { z } from 'zod';

// ------------------ Shared types ------------------
const colorSchema = z.object({
  name: z.string().min(1, 'نام رنگ الزامی است'),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'کد رنگ معتبر نیست'),
});

const variantSchema = z.object({
  ram: z.string().min(1, 'رم الزامی است'),
  storage: z.string().min(1, 'حافظه الزامی است'),
});

const specGroupSchema = z.object({
  group: z.string().min(1, 'عنوان گروه مشخصات الزامی است'),
  items: z.array(
    z.object({
      label: z.string().min(1),
      value: z.string().min(1),
    })
  ),
});

// ------------------ Client form schema ------------------
export const productFormSchema = z.object({
  title: z.string().min(3, 'عنوان حداقل ۳ کاراکتر باشد'),
  description: z.string().min(10, 'توضیحات حداقل ۱۰ کاراکتر باشد'),
  price: z.number().min(1000, 'قیمت باید بیشتر از ۱۰۰۰ باشد'),
  discountPrice: z.number().nullable().optional(),
  brandSlug: z.string().min(1, 'برند الزامی است'),
  categorySlug: z.string().min(1, 'دسته‌بندی الزامی است'),
  stockQuantity: z.number().int().min(0, 'موجودی نمی‌تواند منفی باشد'),
  thumbnail: z.union([z.instanceof(File), z.string()]).optional(),
  images: z.array(z.union([z.instanceof(File), z.string()])).optional(),
  keyFeatures: z.array(z.string()).optional(),
  colors: z.array(colorSchema).optional(),
  variants: z.array(variantSchema).optional(),
  specifications: z.array(specGroupSchema).optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});
export type ProductFormType = z.infer<typeof productFormSchema>;

// اسکیمای ارسال از کلاینت به API
export const createProductPayloadSchema = z.object({
  title: z.string().min(3, 'عنوان حداقل ۳ کاراکتر').max(200),
  description: z.string().min(20, 'توضیحات حداقل ۲۰ کاراکتر'),
  price: z.number().positive('قیمت باید مثبت باشد'),
  discountPrice: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0).default(0),
  thumbnail: z.string().optional().nullable(),

  images: z.array(z.string()).optional().default([]),
  keyFeatures: z.array(z.string()).optional().default([]),
  colors: z.array(colorSchema).optional().default([]),
  variants: z.array(variantSchema).optional().default([]),
  specifications: z.array(specGroupSchema).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  brandSlug: z.string().min(1, 'برند الزامی است'),
  categorySlug: z.string().min(1, 'دسته‌بندی الزامی است'),
  subCategorySlug: z.string().optional().nullable(),
});

export type CreateProductPayload = z.infer<typeof createProductPayloadSchema>;
// ------------------ Server create schema ------------------
export const createProductSchema = z.object({
  title: z.string().min(3, 'عنوان حداقل ۳ کاراکتر').max(200),
  slug: z.string().optional(),
  description: z.string().min(20, 'توضیحات حداقل ۲۰ کاراکتر'),
  price: z.number().positive('قیمت باید مثبت باشد'),
  discountPrice: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0).default(0),
  thumbnail: z.string().optional().nullable(),

  images: z.array(z.string()).optional(),
  keyFeatures: z.array(z.string()).optional().default([]),
  colors: z.array(colorSchema).optional().default([]),
  variants: z.array(variantSchema).optional().default([]),
  specifications: z.array(specGroupSchema).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  brandSlug: z.string().min(1, 'برند الزامی است'),
  categorySlug: z.string().min(1, 'دسته‌بندی الزامی است'),
  subCategorySlug: z.string().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

// ------------------ Server update schema ------------------
export const updateProductSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(20).optional(),
  price: z.number().positive().optional(),
  discountPrice: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0).optional(),
  thumbnail: z.url().optional().nullable(),
  images: z.array(z.url()).optional(),
  keyFeatures: z.array(z.string()).optional(),
  colors: z.array(colorSchema).optional(),
  variants: z.array(variantSchema).optional(),
  specifications: z.array(specGroupSchema).optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  brandSlug: z.string().min(1).optional(),
  categorySlug: z.string().min(1).optional(),
  subCategorySlug: z.string().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
