import Link from 'next/link';
import { Tag, Plus } from 'lucide-react';
import BrandLogos from '@/components/sections/brand/BrandLogos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BrandsPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-8 py-16" dir="rtl">
      <Card className="overflow-hidden border-border/60 bg-card/80 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/40 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Tag className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">مدیریت برندها</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  فهرست برندهای ثبت‌شده را مشاهده و مدیریت کنید.
                </p>
              </div>
            </div>

            <Button asChild size="sm" className="gap-2">
              <Link href="/admin/brands/create">
                <Plus className="size-4" />
                برند جدید
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <BrandLogos />
        </CardContent>
      </Card>
    </div>
  );
}
