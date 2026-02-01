// app/(admin)/brands/edit/[slug]/page.tsx
'use client';

import { BrandForm } from '@/components/sections/brand/BrandForm';
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (data: any) => {
    updateMutation.mutate(
      {
        ...data,
        slug,
      },
      {
        onSuccess: () => {
          toast.success('برند با موفقیت ویرایش شد ✅');
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
      />
    </div>
  );
}
