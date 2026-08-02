'use client';

import { Tag } from 'lucide-react';
import { BrandForm } from '@/components/sections/brand/BrandForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetBrand, useUpdateBrand } from '@/hooks/useBrands';
import { useNotify } from '@/hooks/useNotify';
import { UpdateBrandInput } from '@/lib/validation/brand';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditBrandPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { data: brand, isLoading } = useGetBrand(slug);
  const updateMutation = useUpdateBrand();
  const notify = useNotify();

  const handleSubmit = (formData: UpdateBrandInput) => {
    updateMutation.mutate(
      { slug, data: formData },
      {
        onSuccess: () => {
          notify.success('برند با موفقیت ویرایش شد ✅');
          router.push('/admin/brands');
          router.refresh();
        },
        onError: (err: any) => {
          const message = err?.response?.data?.error || 'خطا در ویرایش رخ داد ❌';
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
            <Tag className="size-5" />
          </div>
          <CardTitle className="text-lg">ویرایش برند</CardTitle>
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
          ) : !brand ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              برند یافت نشد.
            </div>
          ) : (
            <BrandForm
              mode="edit"
              initialValues={brand}
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
