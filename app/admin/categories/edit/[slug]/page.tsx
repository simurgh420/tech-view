'use client';

import { FolderTree } from 'lucide-react';
import { CategoryForm } from '@/components/sections/categories/CategoryForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCategory, useUpdateCategory } from '@/hooks/useCategories';
import { useNotify } from '@/hooks/useNotify';
import { EditCategoryInput } from '@/lib/validation/category';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: category, isLoading } = useGetCategory(slug);
  const updateMutation = useUpdateCategory();
  const notify = useNotify();

  const handleSubmit = (formData: EditCategoryInput) => {
    updateMutation.mutate(
      { slug, data: formData },
      {
        onSuccess: () => {
          notify.success('دسته‌بندی با موفقیت ویرایش شد ✅');
          router.push('/admin/categories');
          router.refresh();
        },
        onError: (err: any) => {
          const message = err?.response?.data?.error || 'خطا در ویرایش دسته‌بندی ❌';
          notify.error(message);
        },
      }
    );
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-8 py-16" dir="rtl">
      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardHeader className="flex-row items-center gap-3 space-y-0 border-b border-border/60 bg-muted/40 px-6 py-5">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <FolderTree className="size-5" />
          </div>
          <CardTitle className="text-lg">ویرایش دسته‌بندی</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : !category ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              دسته‌بندی یافت نشد.
            </div>
          ) : (
            <CategoryForm
              mode="edit"
              initialValues={category}
              onSubmit={handleSubmit}
              isLoading={updateMutation.isPending}
              slug={slug}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
