// hooks/useOrders.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  cancelOrderApi,
  createOrderApi,
  updateOrderStatusApi,
} from '@/services/orders/api/mutations';
import {
  fetchAdminOrderByIdApi,
  fetchAdminOrdersApi,
  getOrderByIdApi,
  getUserOrdersApi,
} from '@/services/orders/api/queries';
import { CheckoutPayloadType } from '@/lib/validation/checkout';
import { cartKeys } from '@/hooks/useCart';

/** کلیدهای کوئری متمرکز برای سفارش‌ها */
export const orderKeys = {
  all: ['orders'] as const,
  detail: (orderId: string) => [...orderKeys.all, orderId] as const,
};
export const adminOrderKeys = {
  all: ['admin-orders'] as const,
  detail: (orderId: string) => [...adminOrderKeys.all, orderId] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** لیست سفارش‌های کاربر */
export function useGetUserOrders() {
  return useQuery({
    queryKey: orderKeys.all,
    queryFn: getUserOrdersApi,
    staleTime: 60 * 1000,
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
export function useGetAdminOrders() {
  return useQuery({
    queryKey: adminOrderKeys.all,
    queryFn: fetchAdminOrdersApi,
    staleTime: 60 * 1000,
  });
}

/** جزئیات یک سفارش (ادمین) */
export function useGetAdminOrderById(orderId: string) {
  return useQuery({
    queryKey: adminOrderKeys.detail(orderId),
    queryFn: () => fetchAdminOrderByIdApi(orderId),
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
export function useCancelOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => cancelOrderApi(orderId),
    onSuccess: (_res, orderId) => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
      qc.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
  });
}

/** تغییر وضعیت سفارش توسط ادمین */
export function useUpdateOrderStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatusApi(orderId, status),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: adminOrderKeys.all });
      qc.invalidateQueries({ queryKey: adminOrderKeys.detail(vars.orderId) });
    },
  });
}
