'use client';

import { useGetBrands } from '@/hooks/useBrands';
import { useGetCategories } from '@/hooks/useCategories';
import { useGetProduct } from '@/hooks/useProducts';

import { Skeleton } from '@/components/ui/skeleton';

import ProductEditForm from './ProductEditForm';

type EditProductProps = {
  slug: string;
};

export default function EditProductPageClient({ slug }: EditProductProps) {
  const { data: product, isLoading, isError } = useGetProduct(slug);

  const { data: brands } = useGetBrands();

  const { data: categories } = useGetCategories();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <Skeleton variant="text" className="mb-6 h-8 w-2/3" />

        <Skeleton variant="rect" className="h-10 w-full" />

        <Skeleton variant="rect" className="h-32 w-full" />

        <div className="grid grid-cols-2 gap-4">
          <Skeleton variant="rect" className="h-10 w-full" />

          <Skeleton variant="rect" className="h-10 w-full" />
        </div>

        <Skeleton variant="rect" className="h-10 w-full" />

        <Skeleton variant="rect" className="h-40 w-full" />

        <Skeleton variant="rect" className="h-40 w-full" />

        <Skeleton variant="rect" className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !product) {
    return <p>خطا در دریافت محصول ❌</p>;
  }

  return <ProductEditForm slug={slug} product={product} brands={brands} categories={categories} />;
}
