// app/(admin)/categories/create/page.tsx
'use client';

import { CategoryForm } from '@/components/sections/categories/CategoryForm';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';

export default function CreateCategoryPage() {
  const { useCreateCategory } = useCategories();
  const createMutation = useCreateCategory();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (formData: any) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('کتگوری با موفقیت ساخته شد ✅');
      },
    });
  };
  return (
    <div className="container mx-auto py-10">
      <CategoryForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />{' '}
    </div>
  );
}
