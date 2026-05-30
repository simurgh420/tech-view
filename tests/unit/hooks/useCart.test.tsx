// tests/unit/hooks/useCart.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCart } from '@/hooks/useCart';
import * as cartQueries from '@/services/cart/api/queries';
import * as cartMutations from '@/services/cart/api/mutations';

vi.mock('@/services/cart/api/queries', () => ({
  fetchCartApi: vi.fn(),
}));

vi.mock('@/services/cart/api/mutations', () => ({
  addCartItemApi: vi.fn(),
  updateCartItemQuantityApi: vi.fn(),
  removeCartItemApi: vi.fn(),
  clearCartApi: vi.fn(),
}));

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

describe('useCart', () => {
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

      const { result } = renderHook(() => useCart().useGetCartItems(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockItems);
      expect(cartQueries.fetchCartApi).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetch fails', async () => {
      const error = new Error('Network error');
      (cartQueries.fetchCartApi as any).mockRejectedValue(error);

      const { result } = renderHook(() => useCart().useGetCartItems(), {
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

      const { result } = renderHook(() => useCart().useAddToCart(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(input);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // ✅ Ignore the second argument (mutation context)
      expect(cartMutations.addCartItemApi).toHaveBeenCalledWith(input, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['cart'] });
    });
  });

describe('useUpdateCartItemQuantity', () => {
  it('should update quantity and invalidate cart query', async () => {
    const params = { id: 'ci1', quantity: 3 };
    const mockResponse = { id: 'ci1', productId: 'p1', quantity: 3 };
    (cartMutations.updateCartItemQuantityApi as any).mockResolvedValue(mockResponse);

    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCart().useUpdateCartItemQuantity(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    result.current.mutate(params);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Exactly two arguments: id and quantity (no extra context)
    expect(cartMutations.updateCartItemQuantityApi).toHaveBeenCalledWith(params.id, params.quantity);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['cart'] });
  });
});
  describe('useRemoveFromCart', () => {
    it('should remove item and invalidate cart query', async () => {
      const itemId = 'ci1';
      (cartMutations.removeCartItemApi as any).mockResolvedValue({ success: true });

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCart().useRemoveFromCart(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(itemId);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // ✅ Mutation functions receive the variable as first arg and context as second
      expect(cartMutations.removeCartItemApi).toHaveBeenCalledWith(itemId, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['cart'] });
    });
  });

  describe('useClearCart', () => {
    it('should clear cart and invalidate cart query', async () => {
      (cartMutations.clearCartApi as any).mockResolvedValue({ success: true });

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCart().useClearCart(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(cartMutations.clearCartApi).toHaveBeenCalledWith(undefined, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['cart'] });
    });
  });
});
