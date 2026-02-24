// app/(admin)/brands/edit/[slug]/page.tsx
'use client';

import { BrandForm, BrandFormType } from '@/components/sections/brand/BrandForm';
import { useBrands } from '@/hooks/useBrands';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function EditBrandPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { useGetBrand, useUpdateBrand } = useBrands();
  const { data: brand, isLoading } = useGetBrand(slug);
  const updateMutation = useUpdateBrand();
  if (isLoading) return <p>در حال بارگذاری...</p>;
  if (!brand) return <p>برند یافت نشد ❌</p>;

  const handleSubmit = (formData: BrandFormType) => {
    updateMutation.mutate(
      {
        slug,
        data: formData,
      },
      {
        onSuccess: () => {
          toast.success('برند با موفقیت ویرایش شد ✅');
        },
        onError: err => {
          console.error(err);
          toast.error('خطا در ویرایش برند ❌');
        },
      }
    );
  };

  return (
    <div className="container mx-auto py-10">
      <BrandForm
        initialValues={brand}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        slug={slug}
      />
    </div>
  );
}
