import CategoryList from '@/components/sections/categories/CategoryList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CategoriesPage() {
  return (
    <div className="container mx-auto py-10" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">کتگوری‌های ساخته شده</h1>
        <Link href="/categories/create">
          <Button>ساخت کتگوری جدید</Button>
        </Link>
      </div>

      <CategoryList />
    </div>
  );
}
