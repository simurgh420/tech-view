'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { TagsInput } from '@/components/Tags/TagsInput';
import { ImageUploader } from '../image/ImageUploader';

const productSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),
  price: z.number().min(1000, 'قیمت باید بیشتر از ۱۰۰۰ باشد'),
  discountPrice: z.number().nullable().optional(),
  brandSlug: z.string().min(1, 'برند الزامی است'),
  categorySlug: z.string().min(1, 'دسته‌بندی الزامی است'),
  stockQuantity: z.number().optional(),
  thumbnail: z.union([z.instanceof(File), z.string()]).optional(),
  specifications: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  tags: z.array(z.string()).optional(), // مثلا برای ویژگی‌ها یا برچسب‌ها
});

export type ProductFormType = z.infer<typeof productSchema>;

type Props = {
  initialValues?: Partial<ProductFormType>;
  onSubmit: (data: ProductFormType) => void;
  isLoading?: boolean;
};

export function ProductForm({ initialValues, onSubmit, isLoading }: Props) {
  const form = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      price: initialValues?.price ?? 0,
      discountPrice: initialValues?.discountPrice ?? null,
      brandSlug: initialValues?.brandSlug ?? '',
      categorySlug: initialValues?.categorySlug ?? '',
      stockQuantity: initialValues?.stockQuantity ?? 0,
      thumbnail: undefined,
      specifications: initialValues?.specifications ?? {},
      tags: initialValues?.tags ?? [],
    },
  });

  return (
    <Form {...form}>
      <form
        data-testid="product-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        dir="rtl"
      >
        {/* عنوان */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان محصول</FormLabel>
              <FormControl>
                <Input
                  className="text-right"
                  placeholder="مثلاً: گوشی موبایل سامسونگ A36"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* توضیحات */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>توضیحات</FormLabel>
              <FormControl>
                <Textarea
                  className="text-right"
                  rows={4}
                  placeholder="توضیحات کامل محصول..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* قیمت */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>قیمت</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e =>
                    field.onChange(e.target.value === '' ? undefined : +e.target.value)
                  }
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* قیمت تخفیف */}
        <FormField
          control={form.control}
          name="discountPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>قیمت تخفیف</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* برند */}
        <FormField
          control={form.control}
          name="brandSlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>برند (slug)</FormLabel>
              <FormControl>
                <Input placeholder="مثلاً: samsung" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* دسته‌بندی */}
        <FormField
          control={form.control}
          name="categorySlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>دسته‌بندی (slug)</FormLabel>
              <FormControl>
                <Input placeholder="مثلاً: mobile" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* موجودی انبار */}
        <FormField
          control={form.control}
          name="stockQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>موجودی انبار</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e =>
                    field.onChange(e.target.value === '' ? undefined : +e.target.value)
                  }
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* تصویر شاخص */}
        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تصویر شاخص</FormLabel>
              <FormControl>
                <ImageUploader
                  initialUrl={
                    typeof initialValues?.thumbnail === 'string' ? initialValues.thumbnail : null
                  }
                  onChange={file => field.onChange(file)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* مشخصات (specifications) */}
        {/* این بخش می‌تونه داینامیک باشه: مثلا رم، حافظه، رنگ، دوربین */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ویژگی‌ها / تگ‌ها</FormLabel>
              <FormControl>
                <TagsInput value={field.value || []} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'در حال ذخیره...' : initialValues?.title ? 'ویرایش محصول' : 'ثبت محصول'}
        </Button>
      </form>
    </Form>
  );
}
