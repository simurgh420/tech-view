import BrandLogos from '@/components/sections/brand/BrandLogos';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BrandsPage() {
  return (
    <div className="container mx-auto py-10" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">لوگوهای ساخته شده</h1>
        <Link href="/brands/create">
          <Button>ساخت لوگوی جدید</Button>
        </Link>
      </div>

      <BrandLogos />
    </div>
  );
}
