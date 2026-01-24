// hooks/useCart.ts

import {
  addCartItemApi,
  clearCartApi,
  removeCartItemApi,
  updateCartItemQuantityApi,
} from '@/services/cart/api/mutations';
import { fetchCartItemsApi } from '@/services/cart/api/queries';
import { CartItem, CartItemPayload } from '@/types/cart';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCart(cartId: string | undefined) {
  const qc = useQueryClient();
  const useGetCartItems = () =>
    useQuery<CartItem[]>({
      queryKey: ['cart', cartId],
      queryFn: () => fetchCartItemsApi(cartId!),
      enabled: !!cartId,
    });
  const useAddToCart = () =>
    useMutation({
      mutationFn: (payload: CartItemPayload) => addCartItemApi(payload),
      onSuccess: () => {
        if (cartId) qc.invalidateQueries({ queryKey: ['cart', cartId] });
      },
    });
  const useUpdateCartItemQuantity = () =>
    useMutation({
      mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
        updateCartItemQuantityApi(id, quantity),
      onSuccess: () => {
        if (cartId) qc.invalidateQueries({ queryKey: ['cart', cartId] });
      },
    });
  const useRemoveFromCart = () =>
    useMutation({
      mutationFn: (id: string) => removeCartItemApi(id),
      onSuccess: () => {
        if (cartId) qc.invalidateQueries({ queryKey: ['cart', cartId] });
      },
    });
  const useClearCart = () =>
    useMutation({
      mutationFn: () => clearCartApi(cartId as string),
      onSuccess: () => {
        if (cartId) qc.invalidateQueries({ queryKey: ['cart', cartId] });
      },
    });
  return {
    useGetCartItems,
    useAddToCart,
    useUpdateCartItemQuantity,
    useRemoveFromCart,
    useClearCart,
  };
}
