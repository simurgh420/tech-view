// components/wishlist/WishlistButton.tsx
'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCheckWishlist, useToggleWishlistByProduct } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface Props {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: Props) {
  const { data, isLoading } = useCheckWishlist(productId);
  const { mutate: toggle, isPending } = useToggleWishlistByProduct();

  const isInWishlist = data?.inWishlist ?? false;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({ productId, exists: isInWishlist });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('relative', className)}
      onClick={handleClick}
      disabled={isLoading || isPending}
      title={isInWishlist ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-all',
          isInWishlist ? 'fill-red-500 text-red-500 scale-110' : 'text-muted-foreground'
        )}
      />
    </Button>
  );
}
