// components/product/ProductCard.tsx
'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Zap } from 'lucide-react';

import { Product } from '@/types/product';
import { useNotify } from '@/hooks/useNotify';
import { StarRatingDisplay } from '@/components/ui/star-rating-input';
import { formatPrice } from '@/lib/formatPrice';
import { useAddToCart } from '@/hooks/useCart';

type ProductCardProps = {
  product: Product;
  addToCartLabel?: string;
  addingLabel?: string;
  fastShippingLabel?: string;
};

export default function ProductCard({
  product,
  addToCartLabel = 'افزودن به سبد',
  addingLabel = 'در حال افزودن...',
  fastShippingLabel = 'ارسال سریع',
}: ProductCardProps) {
  const add = useAddToCart();
  const notify = useNotify();

  const titleContainerRef = useRef<HTMLHeadingElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  useLayoutEffect(() => {
    function measure() {
      if (!titleContainerRef.current || !titleTextRef.current) return;
      const diff = titleTextRef.current.scrollWidth - titleContainerRef.current.clientWidth;
      setOverflowPx(diff > 0 ? diff : 0);
    }

    measure();

    // ResizeObserver فقط وقتی خودِ این کارت اندازه‌ش عوض بشه فایر می‌شه،
    // نه با هر resize پنجره (دقیق‌تر و کم‌هزینه‌تر از window resize listener)
    if (!titleContainerRef.current) return;
    const observer = new ResizeObserver(measure);
    observer.observe(titleContainerRef.current);
    return () => observer.disconnect();
  }, [product.title]);

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
  const isOverflowing = overflowPx > 0;

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
        {/* عنوان — با هاور روی کارت، اگه متن سرریز داشته باشه به‌صورت قطاری کامل نمایش داده می‌شه */}
        <h2 ref={titleContainerRef} className="relative h-5 overflow-hidden whitespace-nowrap">
          <span
            ref={titleTextRef}
            className={`
              inline-block
              text-[14px]
              font-medium
              leading-5
              text-neutral-800
              transition-colors
              group-hover:text-red-600
              dark:text-neutral-100
              dark:group-hover:text-red-400
              ${isOverflowing ? 'group-hover:[animation:marquee_3.5s_linear_infinite]' : ''}
            `}
            style={
              isOverflowing
                ? ({ '--marquee-distance': `-${overflowPx}px` } as React.CSSProperties)
                : undefined
            }
          >
            {product.title}
          </span>
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
        </div>
        {/* قیمت */}
        <div className="mt-auto space-y-2 pt-1">
          {product.isDiscounted ? (
            <>
              <div className="flex items-center gap-2">
                <span
                  className="
                    text-base
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
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <span
                className="
                  text-xs
                  font-bold
                  tracking-tight
                  text-neutral-900
                  dark:text-neutral-100
                "
              >
                {formatPrice(product.price)}
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
