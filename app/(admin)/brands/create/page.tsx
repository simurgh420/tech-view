'use client';

//app/(admin)/brands/create/page.tsx
import { BrandForm, BrandFormType } from '@/components/sections/brand/BrandForm';
import { useBrands } from '@/hooks/useBrands';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
export default function CreateBrandPage() {
  const { useCreateBrand } = useBrands();
  const createMutation = useCreateBrand();
  const router = useRouter();
  const handleSubmit = (data: BrandFormType) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success('برند با موفقیت ایجاد شد ✅');
        router.push('/brands');
      },
      onError: err => {
        console.error(err);
        toast.error('خطا در ایجاد برند ❌');
      },
    });
  };
  return (
    <div className="container mx-auto py-10">
      <BrandForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </div>
  );
}
