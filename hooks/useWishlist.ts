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

export function useWishlist() {
  const qc = useQueryClient();

  const useGetWishlist = () =>
    useQuery<WishlistItem[]>({
      queryKey: ['wishlist'],
      queryFn: fetchWishlistApi,
    });
  // اضافه کردن

  const useAddToWishlist = () =>
    useMutation<WishlistItem, Error, WishlistItemInput>({
      mutationFn: addWishlistItemApi,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
    });

  // حذف با id
  const useRemoveFromWishlist = () =>
    useMutation<{ success: boolean }, Error, string>({
      mutationFn: deleteWishlistItemApi,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
    });
  const useCheckWishlist = (productId: string) =>
    useQuery<{ inWishlist: boolean }>({
      queryKey: ['wishlist', 'check', productId],
      queryFn: () => fetchWishlistCheckApi(productId),
      enabled: !!productId,
    });
  const useToggleWishlistByProduct = () =>
    useMutation<{ success: boolean }, Error, { productId: string; exists: boolean }>({
      mutationFn: async ({ productId, exists }) => {
        if (exists) {
          // اگر وجود داشت، حذف کن
          return deleteWishlistItemByUserAndProductApi(productId);
        }
        // در غیر این صورت اضافه کن
        await addWishlistItemApi({ productId });
        return { success: true };
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
    });

  return {
    useGetWishlist,
    useAddToWishlist,
    useRemoveFromWishlist,
    useCheckWishlist,
    useToggleWishlistByProduct,
  };
}
