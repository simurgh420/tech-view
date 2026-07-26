// tests/unit/hooks/useCart.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import {
  useGetCartItems,
  useAddToCart,
  useUpdateCartItemQuantity,
  useRemoveFromCart,
  useClearCart,
  cartKeys,
} from '@/hooks/useCart';

import * as cartQueries from '@/services/cart/api/queries';
import * as cartMutations from '@/services/cart/api/mutations';

// ─── Mock API ها ──────────────────────────────────────────
vi.mock('@/services/cart/api/queries', () => ({
  fetchCartApi: vi.fn(),
}));

vi.mock('@/services/cart/api/mutations', () => ({
  addCartItemApi: vi.fn(),
  updateCartItemQuantityApi: vi.fn(),
  removeCartItemApi: vi.fn(),
  clearCartApi: vi.fn(),
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
describe('useCart hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetCartItems', () => {
    it('should fetch cart items successfully', async () => {
      const mockItems = [
        { id: 'ci1', productId: 'p1', quantity: 2 },
        { id: 'ci2', productId: 'p2', quantity: 1 },
      ];
      (cartQueries.fetchCartApi as any).mockResolvedValue(mockItems);

      const { result } = renderHook(() => useGetCartItems(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockItems);
      expect(cartQueries.fetchCartApi).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetch fails', async () => {
      const error = new Error('Network error');
      (cartQueries.fetchCartApi as any).mockRejectedValue(error);

      const { result } = renderHook(() => useGetCartItems(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useAddToCart', () => {
    it('should add item to cart and invalidate cart query', async () => {
      const input = { productId: 'p1', quantity: 2 };
      const mockResponse = { id: 'ci1', productId: 'p1', quantity: 2 };
      (cartMutations.addCartItemApi as any).mockResolvedValue(mockResponse);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useAddToCart(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(input);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(cartMutations.addCartItemApi).toHaveBeenCalledWith(input, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: cartKeys.all });
    });
  });

  describe('useUpdateCartItemQuantity', () => {
    it('should update quantity and invalidate cart query', async () => {
      const params = { id: 'ci1', quantity: 3 };
      const mockResponse = { id: 'ci1', productId: 'p1', quantity: 3 };
      (cartMutations.updateCartItemQuantityApi as any).mockResolvedValue(mockResponse);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateCartItemQuantity(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(params);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(cartMutations.updateCartItemQuantityApi).toHaveBeenCalledWith(
        params.id,
        params.quantity
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: cartKeys.all });
    });

    it('should remove item if quantity < 1', async () => {
      const params = { id: 'ci1', quantity: 0 };
      (cartMutations.removeCartItemApi as any).mockResolvedValue({ success: true });

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateCartItemQuantity(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(params);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // removeCartItemApi از داخل wrapper صدا زده می‌شود، فقط با id
      expect(cartMutations.removeCartItemApi).toHaveBeenCalledWith(params.id);
      expect(cartMutations.updateCartItemQuantityApi).not.toHaveBeenCalled();
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: cartKeys.all });
    });
  });

  describe('useRemoveFromCart', () => {
    it('should remove item and invalidate cart query', async () => {
      const itemId = 'ci1';
      (cartMutations.removeCartItemApi as any).mockResolvedValue({ success: true });

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useRemoveFromCart(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(itemId);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // removeCartItemApi مستقیماً به‌عنوان mutationFn استفاده شده، پس با context صدا زده می‌شود
      expect(cartMutations.removeCartItemApi).toHaveBeenCalledWith(itemId, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: cartKeys.all });
    });
  });

  describe('useClearCart', () => {
    it('should clear cart and invalidate cart query', async () => {
      (cartMutations.clearCartApi as any).mockResolvedValue({ success: true });

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useClearCart(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(cartMutations.clearCartApi).toHaveBeenCalledWith(undefined, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: cartKeys.all });
    });
  });
});
