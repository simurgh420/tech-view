'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shirt,
  Phone,
  Book,
  Laptop,
  Camera,
  FolderTree,
  ListTree,
  Pencil,
  Trash2,
  RefreshCw,
} from 'lucide-react';

import { useDeleteCategory, useGetCategories } from '@/hooks/useCategories';
import { useNotify } from '@/hooks/useNotify';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const iconMap: Record<string, React.ElementType> = {
  Shirt,
  Phone,
  Book,
  Laptop,
  Camera,
};

export default function CategoryList() {
  const { data: categories, isLoading, isError, refetch } = useGetCategories();
  const deleteMutation = useDeleteCategory();
  const notify = useNotify();

  const [pendingDeleteSlug, setPendingDeleteSlug] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!pendingDeleteSlug) return;

    const slug = pendingDeleteSlug;
    setPendingDeleteSlug(null);

    deleteMutation.mutate(slug, {
      onSuccess: () => {
        notify.success('دسته‌بندی حذف شد ✅');
      },
      onError: (err: any) => {
        const message = err?.response?.data?.error || 'خطا در حذف دسته‌بندی ❌';
        notify.error(message);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-28 w-28 rounded-md" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 p-10 text-center">
        <p className="text-sm text-destructive">دریافت لیست دسته‌بندی‌ها با خطا مواجه شد.</p>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => refetch()}>
          <RefreshCw className="size-3.5" />
          تلاش مجدد
        </Button>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center">
        <FolderTree className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">هیچ دسته‌ای ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map(category => {
          const IconComp = category.icon ? iconMap[category.icon] : null;

          return (
            <div
              key={category.slug}
              className="group flex flex-col items-center gap-2 rounded-lg border border-transparent p-3 transition-colors hover:border-border/60 hover:bg-muted/40"
            >
              <div className="flex h-28 w-28 items-center justify-center rounded-md border bg-muted/30 shadow-sm">
                {IconComp ? (
                  <IconComp size={40} className="text-muted-foreground" />
                ) : (
                  <span className="text-xs text-muted-foreground">بدون آیکون</span>
                )}
              </div>

              <p className="text-center text-sm font-medium">{category.title}</p>

              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button asChild size="icon" variant="ghost" title="مشخصات فنی" className="size-7">
                  <Link href={`/admin/categories/${category.slug}/attributes`}>
                    <ListTree className="size-3.5" />
                  </Link>
                </Button>

                <Button asChild size="icon" variant="ghost" title="ویرایش" className="size-7">
                  <Link href={`/admin/categories/edit/${category.slug}`}>
                    <Pencil className="size-3.5" />
                  </Link>
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  title="حذف"
                  className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setPendingDeleteSlug(category.slug)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog
        open={!!pendingDeleteSlug}
        onOpenChange={open => !open && setPendingDeleteSlug(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف این دسته‌بندی؟</AlertDialogTitle>
            <AlertDialogDescription>
              این دسته‌بندی و ارتباط آن با محصولات و مشخصات فنی حذف می‌شود. این عملیات قابل بازگشت
              نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleConfirmDelete()}
            >
              حذف کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
