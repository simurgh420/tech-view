'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetInfiniteProducts } from '@/hooks/useProducts';
import { buildFiltersQueryString, parseSpecsFromURL } from '@/lib/url-helpers';
import { FiltersProduct } from '@/types/product';

type FixedFilters = Partial<Pick<FiltersProduct, 'categorySlug' | 'brandSlug'>>;

export function useInfiniteProductsPage(fixed: FixedFilters = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Omit<FiltersProduct, 'page'>>(() => ({
    categorySlug: fixed.categorySlug ?? searchParams.get('categorySlug') ?? undefined,
    brandSlug: fixed.brandSlug ?? searchParams.get('brandSlug') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sort: (searchParams.get('sort') as FiltersProduct['sort']) || 'new',
    q: searchParams.get('q') || undefined,
    perPage: 20,
    specs: parseSpecsFromURL(searchParams),
  }));

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetInfiniteProducts(filters);

  const products = data?.pages.flatMap(page => page.items) ?? [];

  // sync فیلترها با URL
  useEffect(() => {
    const qs = buildFiltersQueryString(filters);
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
  }, [filters, router]);

  // اسکرول بی‌نهایت
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function updateSort(sort: string) {
    setFilters(prev => ({ ...prev, sort: sort as FiltersProduct['sort'] }));
  }

  function updateFilters(next: Partial<FiltersProduct>) {
    setFilters(prev => ({ ...prev, ...next, ...fixed }));
  }

  return {
    filters,
    products,
    sentinelRef,
    updateSort,
    updateFilters,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
  };
}
