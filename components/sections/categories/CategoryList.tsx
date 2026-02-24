'use client';

import { useCategories } from '@/hooks/useCategories';
import Link from 'next/link';
import { Shirt, Phone, Book, Laptop, Camera } from 'lucide-react';

export default function CategoryList() {
  const { useGetCategories } = useCategories();
  const { data: categories, isLoading, isError } = useGetCategories();

  if (isLoading) return <p>در حال بارگذاری...</p>;
  if (isError) return <p>خطا در دریافت دسته‌ها ❌</p>;
  if (!categories || categories.length === 0) return <p>هیچ دسته‌ای ثبت نشده است</p>;

  // مپ آیکون‌ها
  const iconMap: Record<string, React.ElementType> = {
    Shirt,
    Phone,
    Book,
    Laptop,
    Camera,
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {categories.map(category => {
        const IconComp = category.icon ? iconMap[category.icon] : null;

        return (
          <div key={category.slug} className="flex flex-col items-center">
            <Link href={`/categories/edit/${category.slug}`}>
              <div className="w-28 h-28 flex items-center justify-center rounded-md shadow">
                {IconComp ? (
                  <IconComp size={40} className="text-gray-700" />
                ) : (
                  <span className="text-gray-400">بدون آیکون</span>
                )}
              </div>
            </Link>
            <p className="mt-2 text-sm font-medium">{category.title}</p>
          </div>
        );
      })}
    </div>
  );
}
