'use client';

import { FolderTree } from 'lucide-react';
import { CategoryForm } from '@/components/sections/categories/CategoryForm';
import { useCreateCategory } from '@/hooks/useCategories';
import { useNotify } from '@/hooks/useNotify';
import { CreateCategoryInput } from '@/lib/validation/category';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateCategoryPage() {
  const router = useRouter();
  const createMutation = useCreateCategory();
  const notify = useNotify();

  const handleSubmit = (data: CreateCategoryInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        notify.success('دسته‌بندی با موفقیت ساخته شد ✅');
        router.push('/admin/categories');
      },
      onError: (err: any) => {
        const message = err?.response?.data?.error || 'خطا در ایجاد دسته‌بندی ❌';
        notify.error(message);
      },
    });
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-8 py-16" dir="rtl">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex items-center gap-3 space-y-0 border-b border-border/60 px-6 py-5">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <FolderTree className="size-5" />
          </div>
          <CardTitle className="text-lg">ساخت دسته‌بندی جدید</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <CategoryForm
            mode="create"
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
