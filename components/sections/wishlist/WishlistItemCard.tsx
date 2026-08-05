// components/wishlist/WishlistItemCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { WishlistItemWithProduct } from '@/types/wishlist';
import { formatPrice } from '@/lib/formatPrice';

interface Props {
  item: WishlistItemWithProduct;
  onRemove: () => void;
  isRemoving: boolean;
}

export function WishlistItemCard({ item, onRemove, isRemoving }: Props) {
  const product = item.product;
  if (!product) return null;

  return (
    <Card
      className="group relative flex flex-col overflow-hidden transition-shadow hover:shadow-md"
      dir="rtl"
    >
      <Link href={`/products/${product.slug}`} className="block overflow-hidden">
        <div className="relative h-48 w-full bg-muted">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              بدون تصویر
            </div>
          )}
          {product.isDiscounted && (
            <span className="absolute left-2 top-2 rounded-full bg-red-500/90 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              تخفیف
            </span>
          )}
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col justify-between p-4">
        <div>
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary">
              {product.title}
            </h3>
          </Link>

          <div className="mt-2 flex items-baseline gap-2">
            {product.isDiscounted && product.discountPrice ? (
              <>
                <span className="text-base font-bold text-red-600">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-base font-bold">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm" className="w-full gap-2" disabled={isRemoving}>
                <Trash2 className="h-4 w-4" />
                حذف از علاقه‌مندی‌ها
              </Button>
            }
            title="حذف از علاقه‌مندی‌ها"
            description="آیا مطمئن هستید می‌خواهید این محصول را از لیست خود حذف کنید؟"
            confirmText="بله، حذف کن"
            cancelText="لغو"
            onConfirm={onRemove}
          />
        </div>
      </CardContent>
    </Card>
  );
}
