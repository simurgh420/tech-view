// app/(admin)/brands/edit/[slug]/page.tsx
'use client';

import { BrandForm } from '@/components/sections/brand/BrandForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetBrand, useUpdateBrand } from '@/hooks/useBrands';
import { useNotify } from '@/hooks/useNotify';
import { UpdateBrandInput } from '@/lib/validation/brand';
import { useParams, useRouter } from 'next/navigation';

export default function EditBrandPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { data: brand, isLoading } = useGetBrand(slug);
  const updateMutation = useUpdateBrand();
  const notify = useNotify();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <Skeleton variant="text" className="h-8 w-2/3 mb-6" />
        <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
        <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
          <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton variant="rect" className="h-40 w-full rounded-lg" />
        <Skeleton variant="rect" className="h-40 w-full rounded-lg" />
        <Skeleton variant="rect" className="h-12 w-full rounded-lg" />
      </div>
    );
  }
  if (!brand) return <p>برند یافت نشد ❌</p>;

  const handleSubmit = (formData: UpdateBrandInput) => {
    updateMutation.mutate(
      {
        slug,
        data: formData,
      },
      {
        onSuccess: () => {
          notify.success('برند با موفقیت ویرایش شد ✅');
          router.push('/brands');
          router.refresh();
        },
        onError: (err: any) => {
          const message = err?.response?.data?.error || 'خطا در ویرایش رخ داد ❌';
          notify.error(message);
        },
      }
    );
  };
  return (
    <div className="container mx-auto py-10">
      <BrandForm
        mode="edit"
        initialValues={brand}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        slug={slug}
      />
    </div>
  );
}
