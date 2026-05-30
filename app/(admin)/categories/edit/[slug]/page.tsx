// app/(admin)/categories/edit/[slug]/page.tsx
'use client';

import { CategoryForm } from '@/components/sections/categories/CategoryForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '@/hooks/useCategories';
import { useNotify } from '@/hooks/useNotify';
import { EditCategoryInput } from '@/lib/validation/category';
import { useParams } from 'next/navigation';

export default function EditCategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { useGetCategory, useUpdateCategory } = useCategories();
  const { data: category, isLoading } = useGetCategory(slug);
  const updateMutation = useUpdateCategory();
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
  if (!category) return <p>کتگوری یافت نشد ❌</p>;

  const handleSubmit = (formData: EditCategoryInput) => {
    updateMutation.mutate(
      { slug, data: formData },
      {
        onSuccess: () => {
          notify.success('کتگوری با موفقیت ویرایش شد ✅');
        },
        onError: (err: any) => {
          const message = err?.response?.data?.error || 'خطا در ویرایش کتگوری ❌';
          notify.error(message);
        },
      }
    );
  };

  return (
    <div className="container mx-auto py-10">
      <CategoryForm
        mode="edit"
        initialValues={category}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        slug={slug}
      />
    </div>
  );
}
