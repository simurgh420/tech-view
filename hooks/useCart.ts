// hooks/useCart.ts

import {
  addCartItemRequest,
  clearCartRequest,
  removeCartItemRequest,
  updateCartItemQuantityRequest,
} from '@/services/cart/api/mutations';
import { fetchCartItems } from '@/services/cart/api/queries';
import { CartItem, CartItemPayload } from '@/types/cart';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCart(cartId: string | undefined) {
  const queryClient = useQueryClient();
  const useGetCartItems = () =>
    useQuery<CartItem[]>({
      queryKey: ['cart', cartId],
      queryFn: () => fetchCartItems(cartId as string),
      enabled: !!cartId,
    });
  const useAddToCart = () =>
    useMutation({
      mutationFn: (payload: CartItemPayload) => addCartItemRequest(payload),
      onSuccess: () => {
        if (cartId) queryClient.invalidateQueries({ queryKey: ['cart', cartId] });
      },
    });
  const useUpdateCartItemQuantity = () =>
    useMutation({
      mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
        updateCartItemQuantityRequest(id, quantity),
      onSuccess: () => {
        if (cartId) queryClient.invalidateQueries({ queryKey: ['cart', cartId] });
      },
    });
  const useRemoveFromCart = () =>
    useMutation({
      mutationFn: (id: string) => removeCartItemRequest(id),
      onSuccess: () => {
        if (cartId) queryClient.invalidateQueries({ queryKey: ['cart', cartId] });
      },
    });
  const useClearCart = () =>
    useMutation({
      mutationFn: () => clearCartRequest(cartId as string),
      onSuccess: () => {
        if (cartId) queryClient.invalidateQueries({ queryKey: ['cart', cartId] });
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
