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

  const useGetCartItems = () =>
    useQuery<CartItemWithProduct[]>({
      queryKey: ['cart'],
      queryFn: fetchCartApi,
    });

  // ADD TO CART — Optimistic but SAFE
  const useAddToCart = () =>
    useMutation<CartItem, Error, AddCartItemInput, { prevCart: CartItemWithProduct[] | undefined }>(
      {
        mutationFn: addCartItemApi,

        onMutate: async input => {
          await qc.cancelQueries({ queryKey: ['cart'] });

          const prevCart = qc.getQueryData<CartItemWithProduct[]>(['cart']);

          qc.setQueryData<CartItemWithProduct[]>(['cart'], old => {
            if (!old) return old;

            const exists = old.find(i => i.productId === input.productId);

            if (!exists) {
              // ❗ آیتم جدید را optimistic اضافه نمی‌کنیم
              // چون product و priceAtAdd نداریم
              return old;
            }

            return old.map(i =>
              i.productId === input.productId ? { ...i, quantity: i.quantity + input.quantity } : i
            );
          });

          return { prevCart };
        },

        onError: (_err, _vars, ctx) => {
          if (ctx?.prevCart) qc.setQueryData(['cart'], ctx.prevCart);
        },

        onSettled: () => {
          qc.invalidateQueries({ queryKey: ['cart'] });
        },
      }
    );

  // UPDATE QUANTITY — Optimistic SAFE
  const useUpdateCartItemQuantity = () =>
    useMutation<CartItem, Error, { id: string; quantity: number }>({
      mutationFn: ({ id, quantity }) => {
        // اگر 0 یا کمتر شد، به جای آپدیت، حذف واقعی
        if (quantity < 1) {
          return removeCartItemApi(id) as unknown as Promise<CartItem>;
        }
        return updateCartItemQuantityApi(id, quantity);
      },

      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['cart'] });
      },
    });

  // REMOVE — Optimistic SAFE
  const useRemoveFromCart = () =>
    useMutation<
      { success: boolean },
      Error,
      string,
      { prevCart: CartItemWithProduct[] | undefined }
    >({
      mutationFn: removeCartItemApi,

      onMutate: async id => {
        await qc.cancelQueries({ queryKey: ['cart'] });

        const prevCart = qc.getQueryData<CartItemWithProduct[]>(['cart']);

        qc.setQueryData<CartItemWithProduct[]>(['cart'], old =>
          old ? old.filter(i => i.id !== id) : old
        );

        return { prevCart };
      },

      onError: (_err, _vars, ctx) => {
        if (ctx?.prevCart) qc.setQueryData(['cart'], ctx.prevCart);
      },

      onSettled: () => {
        qc.invalidateQueries({ queryKey: ['cart'] });
      },
    });

  // CLEAR — Optimistic SAFE
  const useClearCart = () =>
    useMutation<{ success: boolean }, Error, void, { prevCart: CartItemWithProduct[] | undefined }>(
      {
        mutationFn: clearCartApi,

        onMutate: async () => {
          await qc.cancelQueries({ queryKey: ['cart'] });

          const prevCart = qc.getQueryData<CartItemWithProduct[]>(['cart']);

          qc.setQueryData<CartItemWithProduct[]>(['cart'], []);

          return { prevCart };
        },

        onError: (_err, _vars, ctx) => {
          if (ctx?.prevCart) qc.setQueryData(['cart'], ctx.prevCart);
        },

        onSettled: () => {
          qc.invalidateQueries({ queryKey: ['cart'] });
        },
      }
    );

  return {
    useGetCartItems,
    useAddToCart,
    useUpdateCartItemQuantity,
    useRemoveFromCart,
    useClearCart,
  };
}
