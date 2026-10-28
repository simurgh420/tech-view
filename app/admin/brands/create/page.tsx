'use client';

import { Tag } from 'lucide-react';
import { BrandForm } from '@/components/sections/brand/BrandForm';
import { useCreateBrand } from '@/hooks/useBrands';
import { useNotify } from '@/hooks/useNotify';
import { CreateBrandInput } from '@/lib/validation/brand';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateBrandPage() {
  const createMutation = useCreateBrand();
  const router = useRouter();
  const notify = useNotify();

  const handleSubmit = (data: CreateBrandInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        notify.success('برند با موفقیت ایجاد شد ✅');
        router.push('/admin/brands');
      },
      onError: (err: any) => {
        const message = err?.response?.data?.error || 'خطا در ایجاد برند ❌';
        notify.error(message);
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex  flex-row items-center gap-3 space-y-0 border-b border-border/60  px-2 py-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <Tag className="size-5" />
          </div>
          <CardTitle className="text-lg">ساخت برند جدید</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <BrandForm mode="create" onSubmit={handleSubmit} isLoading={createMutation.isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
