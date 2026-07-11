// components/product/ProductCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { useNotify } from '@/hooks/useNotify';
import { ShoppingCart, Star, Zap } from 'lucide-react';

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat('fa-IR').format(Number(price));

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart().useAddToCart();
  const notify = useNotify();
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // جلوگیری از رفتن به صفحه محصول
    add.mutate(
      { productId: product.id, quantity: 1 },
      {
        onError: () => notify.error('خطا در افزودن به سبد'),
      }
    );
  };
  const rating = Number(product.rating) || 0;
  return (
    <Link
      href={`/products/${product.slug}`}
      dir="rtl"
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
    >
      {/* تصویر */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-gray-950/60">
        <Image
          src={product.thumbnail || '/placeholder.jpg'}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, 220px"
          className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
        />

        {product.isDiscounted && product.discountPercentage !== null && (
          <span className="absolute top-3 start-3 rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white shadow-sm">
            ٪{product.discountPercentage}
          </span>
        )}
      </div>
      {/* محتوا */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h2 className="line-clamp-2 min-h-[2.6rem] text-sm font-medium leading-6 text-gray-800 dark:text-gray-100">
          {product.title}
        </h2>
      </div>
      {/* امتیاز + ارسال */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-yellow-500">
          <Star size={13} fill="currentColor" />
          <span className="font-medium text-gray-600 dark:text-gray-200">
            {rating > 0 ? rating.toFixed(1) : 'بدون امتیاز'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <Zap size={13} fill="currentColor" />
          <span>ارسال سریع</span>
        </div>
      </div>
      {/* قیمت */}
      <div className="mt-auto space-y-0.5 pt-1">
        {product.isDiscounted ? (
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-red-600 dark:text-red-400">
              {formatPrice(product.discountPrice ?? product.price)}
            </span>
            <span className="text-xs text-gray-400 line-through dark:text-gray-500">
              {formatPrice(product.price)}
            </span>
          </div>
        ) : (
          <div className="text-base font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(product.price)}
          </div>
        )}
        <span className="block text-sm text-gray-400"> تومان</span>
      </div>
      {/* دکمه خرید */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={add.isPending}
        className="relative mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-l from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 active:scale-95 disabled:opacity-60"
      >
        <ShoppingCart size={16} />
        {add.isPending ? 'در حال افزودن...' : 'افزودن به سبد خرید'}
      </button>
    </Link>
  );
}
