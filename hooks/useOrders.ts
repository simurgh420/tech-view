// hooks/useOrders.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrderApi } from '@/services/orders/api/mutations';
import { getOrderByIdApi, getUserOrdersApi } from '@/services/orders/api/queries';
import { CheckoutPayloadType } from '@/lib/validation/checkout';

export function useOrders() {
  const qc = useQueryClient();

  // لیست سفارش‌های کاربر
  const useGetUserOrders = () =>
    useQuery({
      queryKey: ['orders'],
      queryFn: getUserOrdersApi,
    });

  // جزئیات یک سفارش
  const useGetOrderById = (orderId: string) =>
    useQuery({
      queryKey: ['orders', orderId],
      queryFn: () => getOrderByIdApi(orderId),
      enabled: !!orderId,
    });

  // ثبت سفارش
  const useCreateOrder = () =>
    useMutation({
      mutationFn: (payload: CheckoutPayloadType) => createOrderApi(payload),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['orders'] });
        qc.invalidateQueries({ queryKey: ['cart'] });
      },
    });

  return {
    useGetUserOrders,
    useGetOrderById,
    useCreateOrder,
  };
}
