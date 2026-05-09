// lib/url-helpers.ts

/**
 * پارس کردن پارامترهای `specs[key]=value` از URL و تبدیل آن به یک Record
 */
export function parseSpecsFromURL(searchParams: URLSearchParams): Record<string, string> | undefined {
  const specs: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    const match = key.match(/^specs\[(.+)\]$/);
    if (match) {
      specs[match[1]] = value;
    }
  });
  return Object.keys(specs).length > 0 ? specs : undefined;
}

/**
 * ساخت query string از فیلترها (برای URL)
 */
export function buildFiltersQueryString(filters: {
  brandSlug?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  q?: string;
  page?: number;
  specs?: Record<string, string>;
}): string {
  const params = new URLSearchParams();

  if (filters.brandSlug) params.set('brandSlug', filters.brandSlug);
  if (filters.categorySlug) params.set('categorySlug', filters.categorySlug);
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.sort && filters.sort !== 'new') params.set('sort', filters.sort);
  if (filters.q) params.set('q', filters.q);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  if (filters.specs) {
    Object.entries(filters.specs).forEach(([key, value]) => {
      params.set(`specs[${key}]`, value);
    });
  }

  return params.toString();
}
