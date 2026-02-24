'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { TitleField } from './fields/TitleField';
import { DescriptionField } from './fields/DescriptionField';
import { PriceField } from './fields/PriceField';
import { DiscountPriceField } from './fields/DiscountPriceField';
import { BrandField } from './fields/BrandField';
import { CategoryField } from './fields/CategoryField';
import { StockField } from './fields/StockField';
import { ThumbnailField } from './fields/ThumbnailField';
import { KeyFeaturesField } from './fields/KeyFeaturesField';
import { ColorsField } from './fields/ColorsField';
import { VariantsField } from './fields/VariantsField';
import { SpecificationsField } from './fields/SpecificationsField';
import { GalleryField } from './fields/GalleryField';
import { ProductFormValues, productSchema } from './product.schema';

type Brand = { slug: string; name: string };
type Category = { slug: string; title: string };

type Props = {
  initialValues?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => void;
  isLoading?: boolean;
  brands?: Brand[];
  categories?: Category[];
};

export function ProductForm({
  initialValues,
  onSubmit,
  isLoading,
  brands = [],
  categories = [],
}: Props) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      price: initialValues?.price ?? 0,
      discountPrice: initialValues?.discountPrice ?? null,
      brandSlug: initialValues?.brandSlug ?? '',
      categorySlug: initialValues?.categorySlug ?? '',
      stockQuantity: initialValues?.stockQuantity ?? 0,
      specifications: initialValues?.specifications ?? [{ group: 'مشخصات عمومی', items: [] }],
      thumbnail: initialValues?.thumbnail ?? undefined,

      keyFeatures: initialValues?.keyFeatures ?? [],
      colors: initialValues?.colors ?? [],
      variants: initialValues?.variants ?? [],
      images: initialValues?.images ?? [],
    },
  });

  return (
    <Form {...form}>
      <form
        data-testid="product-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-10"
        dir="rtl"
      >
        <TitleField control={form.control} />
        <DescriptionField control={form.control} />
        <PriceField control={form.control} />
        <DiscountPriceField control={form.control} />
        <BrandField control={form.control} brands={brands} />
        <CategoryField control={form.control} categories={categories} />
        <StockField control={form.control} />
        <ThumbnailField control={form.control} />

        <KeyFeaturesField control={form.control} />
        <ColorsField control={form.control} />
        <VariantsField control={form.control} />
        <SpecificationsField control={form.control} />
        <GalleryField control={form.control} />

        <Button type="submit" className="w-full" disabled={!!isLoading}>
          {isLoading ? 'در حال ذخیره...' : 'ثبت محصول'}
        </Button>
      </form>
    </Form>
  );
}
