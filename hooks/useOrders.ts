// hooks/useOrders.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrderApi } from '@/services/orders/api/mutations';
import { getOrderByIdApi, getUserOrdersApi } from '@/services/orders/api/queries';
import { CheckoutPayloadType } from '@/lib/validation/checkout';
import { cartKeys } from '@/hooks/useCart';

/** کلیدهای کوئری متمرکز برای سفارش‌ها */
export const orderKeys = {
  all: ['orders'] as const,
  detail: (orderId: string) => [...orderKeys.all, orderId] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** لیست سفارش‌های کاربر */
export function useGetUserOrders() {
  return useQuery({
    queryKey: orderKeys.all,
    queryFn: getUserOrdersApi,
  });
}

/** جزئیات یک سفارش بر اساس شناسه */
export function useGetOrderById(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrderByIdApi(orderId),
    enabled: !!orderId,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

/** ثبت سفارش — بعد از موفقیت، سفارش‌ها و سبد خرید invalidate می‌شوند */
export function useCreateOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckoutPayloadType) => createOrderApi(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
      qc.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
