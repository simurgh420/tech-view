// components/product/ProductCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Zap } from 'lucide-react';

import { Product } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { useNotify } from '@/hooks/useNotify';
import { StarRatingDisplay } from '@/components/ui/star-rating-input';

type ProductCardProps = {
  product: Product;
  locale?: string;
  currencyLabel?: string;
  addToCartLabel?: string;
  addingLabel?: string;
  fastShippingLabel?: string;
};

export default function ProductCard({
  product,
  locale,
  currencyLabel = 'تومان',
  addToCartLabel = 'افزودن به سبد',
  addingLabel = 'در حال افزودن...',
  fastShippingLabel = 'ارسال سریع',
}: ProductCardProps) {
  const add = useCart().useAddToCart();
  const notify = useNotify();

  const resolvedLocale =
    locale ??
    (typeof document !== 'undefined' ? document.documentElement.lang : 'fa-IR') ??
    'fa-IR';

  const formatPrice = (value: string | number) =>
    new Intl.NumberFormat(resolvedLocale).format(Number(value));

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    add.mutate(
      {
        productId: product.id,
        quantity: 1,
      },
      {
        onError: () => notify.error('خطا در افزودن به سبد'),
      }
    );
  };

  const rating = Number(product.rating) || 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="
        group
        flex
        flex-col
        overflow-hidden
        rounded-xl
        border
        border-neutral-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-neutral-300
        hover:shadow-lg
        dark:border-neutral-800
        dark:bg-neutral-900
        dark:hover:border-neutral-700
      "
    >
      {/* تصویر */}
      <div className="relative aspect-square overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <Image
          src={product.thumbnail || '/placeholder.jpg'}
          alt={product.title}
          fill
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 260px"
          className="
            object-contain
            p-3
            transition-transform
            duration-300
            group-hover:scale-105
          "
        />

        {product.isDiscounted && product.discountPercentage !== null && (
          <span
            className="
                absolute
                start-2
                top-2
                rounded-full
                bg-red-600
                px-2.5
                py-1
                text-[11px]
                font-bold
                text-white
                shadow-sm
              "
          >
            %{formatPrice(product.discountPercentage)}
          </span>
        )}
      </div>

      {/* محتوا */}
      <div
        className="
          flex
          flex-1
          flex-col
          gap-1
          p-3
        "
      >
        {/* عنوان */}
        <h2
          className="
           line-clamp-1
            min-h-0
            text-[14px]
            font-medium
            leading-5
            text-neutral-800
            transition-colors
            group-hover:text-red-600
            dark:text-neutral-100
            dark:group-hover:text-red-400
          "
        >
          {product.title}
        </h2>
        {/* امتیاز و ارسال */}
        <div className="flex items-center justify-between">
          <StarRatingDisplay value={rating} size={9} />

          <div
            className="
              flex
              items-center
              gap-1
              rounded-full
              bg-emerald-50
              px-2
              py-1
              text-[11px]
              font-medium
              text-emerald-600
              dark:bg-emerald-950/40
              dark:text-emerald-400
            "
          >
            <Zap size={11} fill="currentColor" />

            <span>{fastShippingLabel}</span>
          </div>
        </div>{' '}
        {/* قیمت */}
        <div className="mt-auto space-y-2 pt-1">
          {product.isDiscounted ? (
            <>
              <div className="flex items-center gap-2">
                <span
                  className="
                    text-lg
                    font-bold
                    tracking-tight
                    text-red-600
                    dark:text-red-400
                  "
                >
                  {formatPrice(product.discountPrice ?? product.price)}
                </span>

                <span
                  className="
                    text-xs
                    text-neutral-400
                    line-through
                    dark:text-neutral-500
                  "
                >
                  {formatPrice(product.price)}
                </span>

                <span
                  className="
                    text-[11px]
                    font-medium
                    text-neutral-500
                    dark:text-neutral-400
                  "
                >
                  {currencyLabel}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <span
                className="
                  text-lg
                  font-bold
                  tracking-tight
                  text-neutral-900
                  dark:text-neutral-100
                "
              >
                {formatPrice(product.price)}
              </span>

              <span
                className="
                  text-[11px]
                  font-medium
                  text-neutral-500
                  dark:text-neutral-400
                "
              >
                {currencyLabel}
              </span>
            </div>
          )}
        </div>
        {/* دکمه خرید */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={add.isPending}
          className="
            mt-2
            flex
            h-8
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-linear-to-l
            from-red-500
            to-rose-600
            text-sm
            font-semibold
            text-white
            shadow-md
            shadow-red-500/20
            transition-all
            duration-300
            hover:shadow-lg
            hover:shadow-red-500/30
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <ShoppingCart size={16} strokeWidth={2.2} />

          <span>{add.isPending ? addingLabel : addToCartLabel}</span>
        </button>
      </div>
    </Link>
  );
}
