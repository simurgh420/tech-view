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

  const useAddToWishlist = () =>
    useMutation<WishlistItem, Error, WishlistItemInput>({
      mutationFn: addWishlistItemApi,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
    });

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
          return deleteWishlistItemByUserAndProductApi(productId);
        }
        await addWishlistItemApi({ productId });
        return { success: true };
      },
      onSuccess: (_data, variables) => {
        qc.invalidateQueries({ queryKey: ['wishlist'] });
        qc.invalidateQueries({ queryKey: ['wishlist', 'check', variables.productId] });
      },
    });

  return {
    useGetWishlist,
    useAddToWishlist,
    useRemoveFromWishlist,
    useCheckWishlist,
    useToggleWishlistByProduct,
  };
}
