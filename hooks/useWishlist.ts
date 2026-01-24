// hooks/useWishlist.ts

import {
  addWishlistItemApi,
  deleteWishlistItemApi,
  deleteWishlistItemByUserAndProductApi,
} from '@/services/wishlist/api/mutations';
import { fetchWishlistApi } from '@/services/wishlist/api/queries';
import { WishlistItem, WishlistPayload } from '@/types/wishlist';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useWishlist(userId: string) {
  const qc = useQueryClient();

  const useGetWishlist = () =>
    useQuery<WishlistItem[]>({
      queryKey: ['wishlist', userId],
      queryFn: () => fetchWishlistApi(userId),
      enabled: !!userId,
    });

  const useAddToWishlist = () =>
    useMutation({
      mutationFn: (payload: WishlistPayload) => addWishlistItemApi(payload),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['wishlist', userId] });
      },
    });

  const useRemoveFromWishlist = () =>
    useMutation({
      mutationFn: (id: string) => deleteWishlistItemApi(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['wishlist', userId] });
      },
    });

  const useToggleWishlistByUserAndProduct = () =>
    useMutation({
      mutationFn: async (payload: WishlistPayload & { exists: boolean }) => {
        if (payload.exists) {
          return deleteWishlistItemByUserAndProductApi({
            userId: payload.userId,
            productId: payload.productId,
          });
        }
        return addWishlistItemApi({ userId: payload.userId, productId: payload.productId });
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['wishlist', userId] });
      },
    });
  return {
    useGetWishlist,
    useAddToWishlist,
    useRemoveFromWishlist,
    useToggleWishlistByUserAndProduct,
  };
}
