// app/(admin)/categories/create/page.tsx
'use client';

import { CategoryForm } from '@/components/sections/categories/CategoryForm';
import { useCreateCategory } from '@/hooks/useCategories';
import { useNotify } from '@/hooks/useNotify';
import { CreateCategoryInput } from '@/lib/validation/category';
import { useRouter } from 'next/navigation';

export default function CreateCategoryPage() {
  const router = useRouter();
  const createMutation = useCreateCategory();
  const notify = useNotify();

  const handleSubmit = (data: CreateCategoryInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        notify.success('کتگوری با موفقیت ساخته شد ✅');
        router.push('/categories');
      },
      onError: (err: any) => {
        const message = err?.response?.data?.error || 'خطا در ایجاد کتگوری ❌';
        notify.error(message);
      },
    });
  };
  return (
    <div className="container mx-auto py-10">
      <CategoryForm
        mode="create"
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />{' '}
    </div>
  );
}
