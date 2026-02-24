// components/product/ProductCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { Button } from '@/components/ui';

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat('fa-IR').format(Number(price));

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="border rounded-lg p-3 hover:shadow-lg transition 
                 flex flex-col"
    >
      {/* تصویر محصول */}
      <Image
        src={product.thumbnail || '/placeholder.jpg'}
        alt={product.title}
        width={300}
        height={300}
        className="w-full h-48 object-cover rounded mb-2"
      />

      {/* عنوان */}
      <h2 className="text-sm font-semibold line-clamp-2">{product.title}</h2>
      {/* قیمت‌ها */}
      <div className="mt-2 flex items-center gap-2">
        {product.isDiscounted ? (
          <>
            <span className="text-red-600 dark:text-red-400 font-bold text-sm">
              {formatPrice(product.discountPrice ?? product.price)} تومان
            </span>
            <span className="line-through text-gray-400 dark:text-gray-500 text-xs">
              {formatPrice(product.price)} تومان
            </span>
            {product.discountPercentage !== null && (
              <span className="bg-red-600  text-xs font-bold px-2 py-0.5 rounded">
                %{product.discountPercentage}
              </span>
            )}
          </>
        ) : (
          <span className="font-bold text-sm">{formatPrice(product.price)} تومان</span>
        )}
      </div>

      {/* امتیاز */}
      <div className="mt-1 flex items-center text-yellow-500 text-xs">
        {'★'.repeat(Math.round(Number(product.rating) || 0)) || 'بدون امتیاز'}
      </div>

      {/* برچسب ارسال */}
      <div className="mt-1 text-green-600 dark:text-green-400 text-xs">ارسال سریع</div>
      {/* دکمه افزودن به سبد */}
      <Button
        variant="default"
        className="mt-auto w-full bg-primary py-2 rounded text-sm hover:bg-primary-dark transition"
      >
        افزودن به سبد
      </Button>
    </Link>
  );
}
