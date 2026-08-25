import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ListTree } from 'lucide-react';

import prisma from '@/services/db/client';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { CategoryAttributesManager } from '@/components/admin/categories/CategoryAttributesManager';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryAttributesPage({ params }: Props) {
  const { slug } = await params;

  const [category] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: { attributes: true }, // اگه اسم relation فرق داره اصلاح کن
        },
      },
    }),

    prisma.category.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true, slug: true },
    }),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <Link
          href="/admin/categories"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          بازگشت به لیست دسته‌بندی‌ها
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>

      <CategoryAttributesManager categorySlug={category.slug} />
    </div>
  );
}
