// tests/unit/hooks/useOrders.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useGetUserOrders, useGetOrderById, useCreateOrder, orderKeys } from '@/hooks/useOrders';

import * as queries from '@/services/orders/api/queries';
import * as mutations from '@/services/orders/api/mutations';

// ─── Mock API ها ──────────────────────────────────────────
vi.mock('@/services/orders/api/queries', () => ({
  getUserOrdersApi: vi.fn(),
  getOrderByIdApi: vi.fn(),
}));

vi.mock('@/services/orders/api/mutations', () => ({
  createOrderApi: vi.fn(),
}));

// ─── Wrapper تست ──────────────────────────────────────────
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

// ─── تست‌ها ──────────────────────────────────────────────
describe('useOrders hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetUserOrders', () => {
    it('should fetch user orders successfully', async () => {
      const mockOrders = [
        { id: 'o1', total: 100, status: 'PAID' },
        { id: 'o2', total: 200, status: 'PENDING' },
      ];
      (queries.getUserOrdersApi as any).mockResolvedValue(mockOrders);

      const { result } = renderHook(() => useGetUserOrders(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockOrders);
      expect(queries.getUserOrdersApi).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetch fails', async () => {
      const error = new Error('Network error');
      (queries.getUserOrdersApi as any).mockRejectedValue(error);

      const { result } = renderHook(() => useGetUserOrders(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useGetOrderById', () => {
    const orderId = 'o1';
    const mockOrder = { id: 'o1', total: 150, status: 'PAID' };

    it('should fetch order by id when orderId is provided', async () => {
      (queries.getOrderByIdApi as any).mockResolvedValue(mockOrder);

      const { result } = renderHook(() => useGetOrderById(orderId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockOrder);
      expect(queries.getOrderByIdApi).toHaveBeenCalledWith(orderId);
    });

    it('should not fetch when orderId is falsy', () => {
      renderHook(() => useGetOrderById(''), { wrapper: createWrapper() });
      expect(queries.getOrderByIdApi).not.toHaveBeenCalled();
    });
  });

  describe('useCreateOrder', () => {
    const payload = {
      fullName: 'John Doe',
      phone: '09123456789',
      city: 'Tehran',
      postalCode: '1234567890',
      address: 'Test Street No 1',
      items: [{ productId: 'p1', quantity: 2 }],
      paymentMethod: 'ONLINE',
    };

    const createdOrder = { id: 'o1', ...payload, status: 'PENDING' };

    it('should create order and invalidate orders and cart queries', async () => {
      (mutations.createOrderApi as any).mockResolvedValue(createdOrder);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateOrder(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(payload);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // createOrderApi فقط با payload صدا زده می‌شود (بدون context)
      expect(mutations.createOrderApi).toHaveBeenCalledWith(payload);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: orderKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['cart'] });
    });

    it('should handle error when creation fails', async () => {
      const error = new Error('Order creation failed');
      (mutations.createOrderApi as any).mockRejectedValue(error);

      const queryClient = new QueryClient();
      const { result } = renderHook(() => useCreateOrder(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(payload);
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });
});
