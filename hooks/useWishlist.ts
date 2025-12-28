// hooks/useWishlist.ts
import {
  addWishlistItem,
  deleteWishlistItem,
  deleteWishlistItemByUserAndProduct,
} from '@/services/wishlist/api/mutations';
import { fetchWishlist } from '@/services/wishlist/api/queries';
import { WishlistItem, WishlistPayload } from '@/types/wishlist';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useWishlist(userId: string) {
  const queryClient = useQueryClient();

  const useGetWishlist = () =>
    useQuery<WishlistItem[]>({
      queryKey: ['wishlist', userId],
      queryFn: () => fetchWishlist(userId),
      enabled: !!userId,
    });

  const useAddToWishlist = () =>
    useMutation({
      mutationFn: (payload: WishlistPayload) => addWishlistItem(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
      },
    });

  const useRemoveFromWishlist = () =>
    useMutation({
      mutationFn: (id: string) => deleteWishlistItem(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
      },
    });

  const useToggleWishlistByUserAndProduct = () =>
    useMutation({
      mutationFn: async (payload: WishlistPayload & { exists: boolean }) => {
        if (payload.exists) {
          return deleteWishlistItemByUserAndProduct({
            userId: payload.userId,
            productId: payload.productId,
          });
        }
        return addWishlistItem({ userId: payload.userId, productId: payload.productId });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
      },
    });
  return {
    useGetWishlist,
    useAddToWishlist,
    useRemoveFromWishlist,
    useToggleWishlistByUserAndProduct,
  };
}
