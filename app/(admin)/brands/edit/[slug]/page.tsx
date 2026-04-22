// app/(admin)/brands/edit/[slug]/page.tsx
'use client';

import { BrandForm, BrandFormType } from '@/components/sections/brand/BrandForm';
import { useBrands } from '@/hooks/useBrands';
import { useNotify } from '@/hooks/useNotify';
import { useParams, useRouter } from 'next/navigation';

export default function EditBrandPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { useGetBrand, useUpdateBrand } = useBrands();
  const { data: brand, isLoading } = useGetBrand(slug);
  const updateMutation = useUpdateBrand();
  const notify = useNotify();

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
          notify.success('برند با موفقیت ویرایش شد ✅');
          router.push('/brands');
          router.refresh();
        },
        onError: err => {
          console.error(err);
          notify.error('خطا در ویرایش برند ❌');
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
