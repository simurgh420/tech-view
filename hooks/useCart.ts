// hooks/useCart.ts

import { CartItem } from '@/app/generated/prisma/client';
import { AddCartItemInput } from '@/lib/validation/cart';
import {
  addCartItemApi,
  clearCartApi,
  removeCartItemApi,
  updateCartItemQuantityApi,
} from '@/services/cart/api/mutations';
import { fetchCartApi } from '@/services/cart/api/queries';
import { CartItemWithProduct } from '@/types/cart';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCart() {
  const qc = useQueryClient();

  const useGetCartItems = () => {
    return useQuery<CartItemWithProduct[]>({
      queryKey: ['cart'],
      queryFn: fetchCartApi,
    });
  };
  const useAddToCart = () =>
    useMutation<CartItem, Error, AddCartItemInput>({
      mutationFn: addCartItemApi,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['cart'] });
      },
    });
  const useUpdateCartItemQuantity = () =>
    useMutation<CartItem, Error, { id: string; quantity: number }>({
      mutationFn: ({ id, quantity }) => updateCartItemQuantityApi(id, quantity),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['cart'] });
      },
    });

  const useRemoveFromCart = () =>
    useMutation<{ success: boolean }, Error, string>({
      mutationFn: removeCartItemApi,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['cart'] });
      },
    });
  const useClearCart = () =>
    useMutation<{ success: boolean }, Error, void>({
      mutationFn: clearCartApi,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['cart'] });
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
