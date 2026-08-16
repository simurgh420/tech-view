'use client';

import { Heart } from 'lucide-react';

import { useCheckWishlist, useToggleWishlistByProduct } from '@/hooks/useWishlist';

import { useNotify } from '@/hooks/useNotify';
import { cn } from '@/lib/utils';

interface Props {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: Props) {
  const notify = useNotify();

  const { data: wishlistStatus, isLoading } = useCheckWishlist(productId);

  const toggleWishlist = useToggleWishlistByProduct();

  const isWishlisted = wishlistStatus?.inWishlist ?? false;

  const disabled = isLoading || toggleWishlist.isPending;

  const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist.mutate(
      {
        productId,
        exists: isWishlisted,
      },
      {
        onError: () => {
          notify.error('برای افزودن به علاقه‌مندی‌ها ابتدا وارد شوید');
        },
      }
    );
  };

  return (
    <button
      type="button"
      onClick={handleToggleWishlist}
      aria-label={isWishlisted ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
      disabled={disabled}
      className={cn(
        `
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          bg-background/80
          shadow-sm
          backdrop-blur-md
          transition-all
          duration-300
          hover:scale-110
          disabled:cursor-not-allowed
          disabled:opacity-60
        `,
        className
      )}
    >
      <Heart
        size={15}
        className={cn(
          'transition-colors duration-200',
          isWishlisted ? 'fill-red-600 text-red-600' : 'text-foreground'
        )}
      />
    </button>
  );
}
