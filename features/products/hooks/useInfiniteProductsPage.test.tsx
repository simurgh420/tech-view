// features/products/hooks/useInfiniteProductsPage.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, render, act } from '@testing-library/react';
import React from 'react';

const router = { replace: vi.fn(), push: vi.fn() };
const replace = router.replace;
const push = router.push;
let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  useSearchParams: () => searchParams,
}));

vi.mock('@/features/products/hooks/useProducts', () => ({
  useGetInfiniteProducts: vi.fn(),
}));

vi.mock('@/lib/url-helpers', () => ({
  buildFiltersQueryString: vi.fn(),
  parseSpecsFromURL: vi.fn(),
}));

import { useGetInfiniteProducts } from '@/features/products/hooks/useProducts';
import { buildFiltersQueryString, parseSpecsFromURL } from '@/lib/url-helpers';
import { useInfiniteProductsPage } from './useInfiniteProductsPage';

// ─── IntersectionObserver ساختگی ───────────────────────────

let observers: MockIntersectionObserver[] = [];

class MockIntersectionObserver {
  callback: (entries: Array<{ isIntersecting: boolean }>) => void;
  options: IntersectionObserverInit | undefined;
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();

  constructor(cb: any, options?: IntersectionObserverInit) {
    this.callback = cb;
    this.options = options;
    observers.push(this);
  }

  trigger(isIntersecting: boolean) {
    this.callback([{ isIntersecting }]);
  }
}

// ─── ابزارهای کمکی ───────────────────────────────────────

const fetchNextPage = vi.fn();

function mockInfinite(overrides: Record<string, unknown> = {}) {
  vi.mocked(useGetInfiniteProducts).mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    fetchNextPage,
    hasNextPage: false,
    isFetchingNextPage: false,
    ...overrides,
  } as any);
}

/** آخرین فیلترهایی که به useGetInfiniteProducts داده شده */
const lastFilters = () => vi.mocked(useGetInfiniteProducts).mock.lastCall![0] as any;

/** هوک را داخل یک کامپوننت واقعی می‌گذارد تا sentinelRef به یک div وصل شود */
function renderWithSentinel() {
  let latest!: ReturnType<typeof useInfiniteProductsPage>;

  function Harness() {
    latest = useInfiniteProductsPage();
    return <div ref={latest.sentinelRef} data-testid="sentinel" />;
  }

  const utils = render(<Harness />);

  return {
    ...utils,
    rerender: () => utils.rerender(<Harness />),
    get result() {
      return { current: latest };
    },
  };
}

describe('useInfiniteProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    observers = [];
    searchParams = new URLSearchParams();
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    vi.mocked(parseSpecsFromURL).mockReturnValue({});
    vi.mocked(buildFiltersQueryString).mockReturnValue('');
    mockInfinite();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('فیلترهای اولیه از URL', () => {
    it('should use defaults when the URL has no params', () => {
      const { result } = renderHook(() => useInfiniteProductsPage());

      expect(result.current.filters).toEqual({
        categorySlug: undefined,
        brandSlug: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sort: 'new',
        q: undefined,
        perPage: 20,
        specs: {},
      });
    });

    it('should read all filters from the URL', () => {
      searchParams = new URLSearchParams(
        'categorySlug=phones&brandSlug=apple&minPrice=100&maxPrice=500&sort=price_asc&q=iphone'
      );
      vi.mocked(parseSpecsFromURL).mockReturnValue({ ram: '8GB' });

      const { result } = renderHook(() => useInfiniteProductsPage());

      expect(result.current.filters).toEqual({
        categorySlug: 'phones',
        brandSlug: 'apple',
        minPrice: 100,
        maxPrice: 500,
        sort: 'price_asc',
        q: 'iphone',
        perPage: 20,
        specs: { ram: '8GB' },
      });
    });

    it('should convert minPrice and maxPrice to numbers', () => {
      searchParams = new URLSearchParams('minPrice=1500000&maxPrice=2500000');

      const { result } = renderHook(() => useInfiniteProductsPage());

      expect(result.current.filters.minPrice).toBe(1500000);
      expect(result.current.filters.maxPrice).toBe(2500000);
    });

    it('should treat empty q as undefined', () => {
      searchParams = new URLSearchParams('q=');

      const { result } = renderHook(() => useInfiniteProductsPage());

      expect(result.current.filters.q).toBeUndefined();
    });

    it('should pass searchParams to parseSpecsFromURL', () => {
      searchParams = new URLSearchParams('spec_ram=8GB');

      renderHook(() => useInfiniteProductsPage());

      expect(parseSpecsFromURL).toHaveBeenCalledWith(searchParams);
    });

    it('should read the initial state only once (lazy init)', () => {
      const { rerender } = renderHook(() => useInfiniteProductsPage());
      const callsAfterMount = vi.mocked(parseSpecsFromURL).mock.calls.length;

      rerender();
      rerender();

      expect(vi.mocked(parseSpecsFromURL).mock.calls.length).toBe(callsAfterMount);
    });
  });

  describe('فیلترهای ثابت (fixed)', () => {
    it('should prefer fixed categorySlug over the URL', () => {
      searchParams = new URLSearchParams('categorySlug=from-url');

      const { result } = renderHook(() => useInfiniteProductsPage({ categorySlug: 'fixed-cat' }));

      expect(result.current.filters.categorySlug).toBe('fixed-cat');
    });

    it('should prefer fixed brandSlug over the URL', () => {
      searchParams = new URLSearchParams('brandSlug=from-url');

      const { result } = renderHook(() => useInfiniteProductsPage({ brandSlug: 'fixed-brand' }));

      expect(result.current.filters.brandSlug).toBe('fixed-brand');
    });

    it('should keep fixed filters after updateFilters tries to override them', () => {
      const { result } = renderHook(() => useInfiniteProductsPage({ categorySlug: 'fixed-cat' }));

      act(() => result.current.updateFilters({ categorySlug: 'hacked', minPrice: 10 }));

      expect(result.current.filters.categorySlug).toBe('fixed-cat');
      expect(result.current.filters.minPrice).toBe(10);
    });
  });

  describe('updateSort و updateFilters', () => {
    it('should update only the sort', () => {
      searchParams = new URLSearchParams('q=iphone');
      const { result } = renderHook(() => useInfiniteProductsPage());

      act(() => result.current.updateSort('price_desc'));

      expect(result.current.filters.sort).toBe('price_desc');
      expect(result.current.filters.q).toBe('iphone');
    });

    it('should merge partial filters into the existing ones', () => {
      searchParams = new URLSearchParams('q=iphone');
      const { result } = renderHook(() => useInfiniteProductsPage());

      act(() => result.current.updateFilters({ minPrice: 100, maxPrice: 900 }));

      expect(result.current.filters).toMatchObject({ q: 'iphone', minPrice: 100, maxPrice: 900 });
    });

    it('should pass the updated filters to useGetInfiniteProducts', () => {
      const { result } = renderHook(() => useInfiniteProductsPage());

      act(() => result.current.updateSort('price_asc'));

      expect(lastFilters().sort).toBe('price_asc');
    });

    it('should NOT reset specs or perPage when updating the sort', () => {
      vi.mocked(parseSpecsFromURL).mockReturnValue({ ram: '8GB' });
      const { result } = renderHook(() => useInfiniteProductsPage());

      act(() => result.current.updateSort('price_asc'));

      expect(result.current.filters.specs).toEqual({ ram: '8GB' });
      expect(result.current.filters.perPage).toBe(20);
    });
  });

  describe('sync با URL', () => {
    it('should replace the URL on mount with the built query string', () => {
      vi.mocked(buildFiltersQueryString).mockReturnValue('sort=new');

      renderHook(() => useInfiniteProductsPage());

      expect(replace).toHaveBeenCalledWith('?sort=new', { scroll: false });
    });

    it('should use "?" when the query string is empty', () => {
      vi.mocked(buildFiltersQueryString).mockReturnValue('');

      renderHook(() => useInfiniteProductsPage());

      expect(replace).toHaveBeenCalledWith('?', { scroll: false });
    });

    it('should pass the current filters to buildFiltersQueryString', () => {
      const { result } = renderHook(() => useInfiniteProductsPage());

      expect(buildFiltersQueryString).toHaveBeenLastCalledWith(result.current.filters);
    });

    it('should replace the URL again when filters change', () => {
      vi.mocked(buildFiltersQueryString).mockImplementation((f: any) => `sort=${f.sort}`);
      const { result } = renderHook(() => useInfiniteProductsPage());
      replace.mockClear();

      act(() => result.current.updateSort('price_asc'));

      expect(replace).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith('?sort=price_asc', { scroll: false });
    });

    it('should NOT use router.push (no history entry per filter change)', () => {
      const { result } = renderHook(() => useInfiniteProductsPage());

      act(() => result.current.updateSort('price_asc'));

      expect(replace).toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
    });
  });

  describe('محصولات', () => {
    it('should return an empty array when there is no data', () => {
      const { result } = renderHook(() => useInfiniteProductsPage());

      expect(result.current.products).toEqual([]);
    });

    it('should flatten items of all pages in order', () => {
      mockInfinite({
        data: {
          pages: [{ items: [{ id: 'a' }, { id: 'b' }] }, { items: [{ id: 'c' }] }],
        },
      });

      const { result } = renderHook(() => useInfiniteProductsPage());

      expect(result.current.products.map((p: any) => p.id)).toEqual(['a', 'b', 'c']);
    });

    it('should return an empty array when pages is empty', () => {
      mockInfinite({ data: { pages: [] } });

      const { result } = renderHook(() => useInfiniteProductsPage());

      expect(result.current.products).toEqual([]);
    });
  });

  describe('pass-through از react-query', () => {
    it('should expose loading, error and pagination flags', () => {
      const error = new Error('failed');
      mockInfinite({ isLoading: true, error, hasNextPage: true, isFetchingNextPage: true });

      const { result } = renderHook(() => useInfiniteProductsPage());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(error);
      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.isFetchingNextPage).toBe(true);
    });
  });

  describe('اسکرول بی‌نهایت', () => {
    it('should NOT create an observer when there is no next page', () => {
      mockInfinite({ hasNextPage: false });

      renderWithSentinel();

      expect(observers).toHaveLength(0);
    });

    it('should NOT create an observer when the sentinel is not attached', () => {
      mockInfinite({ hasNextPage: true });

      renderHook(() => useInfiniteProductsPage());

      expect(observers).toHaveLength(0);
    });

    it('should observe the sentinel with a 400px rootMargin', () => {
      mockInfinite({ hasNextPage: true });

      const { result } = renderWithSentinel();

      expect(observers).toHaveLength(1);
      expect(observers[0].options).toEqual({ rootMargin: '400px' });
      expect(observers[0].observe).toHaveBeenCalledWith(result.current.sentinelRef.current);
    });

    it('should fetch the next page when the sentinel intersects', () => {
      mockInfinite({ hasNextPage: true });
      renderWithSentinel();

      act(() => observers[0].trigger(true));

      expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });

    it('should NOT fetch when the sentinel is not intersecting', () => {
      mockInfinite({ hasNextPage: true });
      renderWithSentinel();

      act(() => observers[0].trigger(false));

      expect(fetchNextPage).not.toHaveBeenCalled();
    });

    it('should NOT fetch while a page is already being fetched', () => {
      mockInfinite({ hasNextPage: true, isFetchingNextPage: true });
      renderWithSentinel();

      act(() => observers[0].trigger(true));

      expect(fetchNextPage).not.toHaveBeenCalled();
    });

    it('should disconnect the observer on unmount', () => {
      mockInfinite({ hasNextPage: true });
      const { unmount } = renderWithSentinel();
      const observer = observers[0];

      unmount();

      expect(observer.disconnect).toHaveBeenCalled();
    });

    it('should recreate the observer when hasNextPage changes', () => {
      mockInfinite({ hasNextPage: true });
      const { rerender } = renderWithSentinel();
      const first = observers[0];

      mockInfinite({ hasNextPage: false });
      rerender();

      expect(first.disconnect).toHaveBeenCalled();
    });
  });
});
