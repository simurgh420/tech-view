import Link from 'next/link';
import { notFound } from 'next/navigation';
import {  ListTree } from 'lucide-react';

import prisma from '@/features/prisma-adapter/client';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { CategoryAttributesManager } from '@/features/admin/components/categories/CategoryAttributesManager';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryAttributesPage({ params }: Props) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      _count: {
        select: { attributes: true },
      },
    },
  });

  if (!category) {
    notFound();
  }
  return (
    <div className="container mx-auto space-y-6 px-6 py-8 sm:px-8 sm:py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">داشبورد</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/categories">دسته‌بندی‌ها</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{category.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" dir="rtl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-muted">
            <ListTree className="h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">مدیریت مشخصات فنی</h1>
              <Badge variant="secondary">{category.title}</Badge>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {category._count.attributes} مشخصه فعال برای این دسته‌بندی تعریف شده است.
            </p>
          </div>
        </div>
      </div>

      <CategoryAttributesManager categorySlug={category.slug} />
    </div>
  );
}
