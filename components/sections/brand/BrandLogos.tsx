'use client';
import { useGetBrands } from '@/hooks/useBrands';
import Image from 'next/image';
import Link from 'next/link';

export default function BrandLogos() {
  const { data: brands, isLoading, isError } = useGetBrands();

  if (isLoading) return <p>در حال بارگذاری...</p>;
  if (isError) return <p>خطا در دریافت برندها ❌</p>;
  if (!brands || brands.length === 0) return <p>هیچ برندی ثبت نشده است</p>;

  return (
    <div className="grid grid-cols-2 gap-6">
      {brands.map(brand => (
        <div key={brand.slug} className="flex flex-col items-center">
          {brand.logo && (
            <Link href={`/brands/edit/${brand.slug}`}>
              <div className="w-28 h-28 flex items-center justify-center rounded-md shadow">
                <Image
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            </Link>
          )}
          <p className="mt-2 text-sm font-medium">{brand.name}</p>
        </div>
      ))}
    </div>
  );
}
