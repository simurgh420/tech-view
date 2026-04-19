// app/(admin)/categories/create/page.tsx
'use client';

import { CategoryForm } from '@/components/sections/categories/CategoryForm';
import { useCategories } from '@/hooks/useCategories';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

export default function CreateCategoryPage() {
  const router = useRouter();
  const { useCreateCategory } = useCategories();
  const createMutation = useCreateCategory();
  const handleSubmit = (formData: any) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('کتگوری با موفقیت ساخته شد ✅');
        router.push('/categories');
      },
      onError: err => {
        console.error(err);
        toast.error('خطا در ایجاد کتگوری ❌');
      },
    });
  };
  return (
    <div className="container mx-auto py-10">
      <CategoryForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />{' '}
    </div>
  );
}
