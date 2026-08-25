import Link from 'next/link';
import { FolderTree, Plus } from 'lucide-react';

import CategoryList from '@/components/sections/categories/CategoryList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function CategoriesPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-8 py-16" dir="rtl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">داشبورد</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>دسته‌بندی‌ها</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/60 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <FolderTree className="size-5" />
              </div>

              <div>
                <CardTitle className="text-lg">مدیریت دسته‌بندی‌ها</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  فهرست دسته‌بندی‌های ثبت‌شده را مشاهده و مدیریت کنید.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="gap-2">
                <Link href="/admin/categories/create">
                  <Plus className="size-4" />
                  دسته‌بندی جدید
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <CategoryList />
        </CardContent>
      </Card>
    </div>
  );
}
