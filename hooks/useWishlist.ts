// hooks/useWishlist.ts
import { WishlistItem } from '@/app/generated/prisma/client';
import { WishlistItemInput } from '@/lib/validation/wishlist';
import {
  addWishlistItemApi,
  deleteWishlistItemApi,
  deleteWishlistItemByUserAndProductApi,
} from '@/services/wishlist/api/mutations';
import { fetchWishlistApi, fetchWishlistCheckApi } from '@/services/wishlist/api/queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/** کلیدهای کوئری متمرکز برای wishlist */
export const wishlistKeys = {
  all: ['wishlist'] as const,
  check: (productId: string) => [...wishlistKeys.all, 'check', productId] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** لیست کامل علاقه‌مندی‌های کاربر */
export function useGetWishlist() {
  return useQuery<WishlistItem[]>({
    queryKey: wishlistKeys.all,
    queryFn: fetchWishlistApi,
  });
}

/** آیا محصول مشخص در لیست علاقه‌مندی‌ها هست یا نه */
export function useCheckWishlist(productId: string) {
  return useQuery<{ inWishlist: boolean }>({
    queryKey: wishlistKeys.check(productId),
    queryFn: () => fetchWishlistCheckApi(productId),
    enabled: !!productId,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

/** افزودن به لیست علاقه‌مندی‌ها */
export function useAddToWishlist() {
  const qc = useQueryClient();

  return useMutation<WishlistItem, Error, WishlistItemInput>({
    mutationFn: addWishlistItemApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}

/** حذف یک آیتم از لیست علاقه‌مندی‌ها (با شناسه‌ی خود آیتم) */
export function useRemoveFromWishlist() {
  const qc = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteWishlistItemApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}

/** تاگل کردن وضعیت علاقه‌مندی بر اساس productId (اضافه/حذف خودکار) */
export function useToggleWishlistByProduct() {
  const qc = useQueryClient();

  return useMutation<{ success: boolean }, Error, { productId: string; exists: boolean }>({
    mutationFn: async ({ productId, exists }) => {
      if (exists) {
        return deleteWishlistItemByUserAndProductApi(productId);
      }
      await addWishlistItemApi({ productId });
      return { success: true };
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: wishlistKeys.all });
      qc.invalidateQueries({ queryKey: wishlistKeys.check(variables.productId) });
    },
  });
}
