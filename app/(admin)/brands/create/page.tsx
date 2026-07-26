'use client';

//app/(admin)/brands/create/page.tsx
import { BrandForm } from '@/components/sections/brand/BrandForm';
import { useCreateBrand } from '@/hooks/useBrands';
import { useNotify } from '@/hooks/useNotify';
import { CreateBrandInput } from '@/lib/validation/brand';
import { useRouter } from 'next/navigation';

export default function CreateBrandPage() {
  const createMutation = useCreateBrand();
  const router = useRouter();
  const notify = useNotify();

  const handleSubmit = (data: CreateBrandInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        notify.success('برند با موفقیت ایجاد شد ✅');
        router.push('/brands');
      },
      onError: (err: any) => {
        const message = err?.response?.data?.error || 'خطا در ایجاد برند ❌';
        notify.error(message);
        console.error(err);
      },
    });
  };
  return (
    <div className="container mx-auto py-10">
      <BrandForm mode="create" onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </div>
  );
}
