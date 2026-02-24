// app/(admin)/categories/edit/[slug]/page.tsx
'use client';

import { CategoryForm } from '@/components/sections/categories/CategoryForm';
import { useCategories } from '@/hooks/useCategories';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function EditCategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { useGetCategory, useUpdateCategory } = useCategories();
  const { data: category, isLoading } = useGetCategory(slug);
  const updateMutation = useUpdateCategory();
  if (isLoading) return <p>در حال بارگذاری...</p>;
  if (!category) return <p>کتگوری یافت نشد ❌</p>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (formData: any) => {
    updateMutation.mutate(
      { slug, data: formData },
      {
        onSuccess: () => {
          toast.success('کتگوری با موفقیت ویرایش شد ✅');
        },
        onError: err => {
          console.error(err);
          toast.error('خطا در ویرایش کتگوری ❌');
        },
      }
    );
  };
  return (
    <div className="container mx-auto py-10">
      <CategoryForm
        initialValues={category}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        slug={slug}
      />
    </div>
  );
}
