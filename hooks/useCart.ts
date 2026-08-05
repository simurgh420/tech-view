// hooks/useCart.ts
import { CartItem } from '@/app/generated/prisma/client';
import { useSession } from '@/lib/auth-client';
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

/** کلید کوئری متمرکز برای سبد خرید — سایر هوک‌ها (مثل useOrders) هم از همین import می‌کنند */
export const cartKeys = {
  all: ['cart'] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** آیتم‌های سبد خرید */
export function useGetCartItems() {
  const { data: session } = useSession();
  return useQuery<CartItemWithProduct[]>({
    queryKey: cartKeys.all,
    queryFn: fetchCartApi,
    enabled: !!session?.user,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

/** افزودن به سبد خرید — Optimistic ولی SAFE */
export function useAddToCart() {
  const qc = useQueryClient();

  return useMutation<
    CartItem,
    Error,
    AddCartItemInput,
    { prevCart: CartItemWithProduct[] | undefined }
  >({
    mutationFn: addCartItemApi,

    onMutate: async input => {
      await qc.cancelQueries({ queryKey: cartKeys.all });

      const prevCart = qc.getQueryData<CartItemWithProduct[]>(cartKeys.all);

      qc.setQueryData<CartItemWithProduct[]>(cartKeys.all, old => {
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
      if (ctx?.prevCart) qc.setQueryData(cartKeys.all, ctx.prevCart);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

/** به‌روزرسانی تعداد — اگر ۰ یا کمتر شد، حذف واقعی انجام می‌شود */
export function useUpdateCartItemQuantity() {
  const qc = useQueryClient();

  return useMutation<CartItem, Error, { id: string; quantity: number }>({
    mutationFn: ({ id, quantity }) => {
      if (quantity < 1) {
        return removeCartItemApi(id) as unknown as Promise<CartItem>;
      }
      return updateCartItemQuantityApi(id, quantity);
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

/** حذف یک آیتم از سبد — Optimistic SAFE */
export function useRemoveFromCart() {
  const qc = useQueryClient();

  return useMutation<
    { success: boolean },
    Error,
    string,
    { prevCart: CartItemWithProduct[] | undefined }
  >({
    mutationFn: removeCartItemApi,

    onMutate: async id => {
      await qc.cancelQueries({ queryKey: cartKeys.all });

      const prevCart = qc.getQueryData<CartItemWithProduct[]>(cartKeys.all);

      qc.setQueryData<CartItemWithProduct[]>(cartKeys.all, old =>
        old ? old.filter(i => i.id !== id) : old
      );

      return { prevCart };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prevCart) qc.setQueryData(cartKeys.all, ctx.prevCart);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

/** خالی کردن کامل سبد خرید — Optimistic SAFE */
export function useClearCart() {
  const qc = useQueryClient();

  return useMutation<
    { success: boolean },
    Error,
    void,
    { prevCart: CartItemWithProduct[] | undefined }
  >({
    mutationFn: clearCartApi,

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: cartKeys.all });

      const prevCart = qc.getQueryData<CartItemWithProduct[]>(cartKeys.all);

      qc.setQueryData<CartItemWithProduct[]>(cartKeys.all, []);

      return { prevCart };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prevCart) qc.setQueryData(cartKeys.all, ctx.prevCart);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
