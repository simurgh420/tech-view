// services/products/api/queries.ts
import { FiltersProduct, Product } from '@/types/product';
import axios from 'axios';

export async function fetchProductsApi(): Promise<Product[]> {
  const res = await axios.get<Product[]>('/api/products');
  return res.data;
}

export async function fetchProductBySlugApi(slug: string): Promise<Product> {
  const res = await axios.get<Product>(`/api/products/${slug}`);
  return res.data;
}
export async function fetchProductsByCategoryApi(slug: string): Promise<Product[]> {
  const res = await axios.get<Product[]>(`/api/products/category/${slug}`);
  return res.data;
}
export async function fetchProductsByBrandApi(slug: string): Promise<Product[]> {
  const res = await axios.get<Product[]>(`/api/products/brand/${slug}`);
  return res.data;
}

export async function fetchFeaturedProductsApi(): Promise<Product[]> {
  const res = await axios.get<Product[]>('/api/products/featured');
  return res.data;
}
// ✅ فانکشن عمومی برای فیلتر و مرتب‌سازی
export async function fetchFilteredProductsApi(filters: FiltersProduct): Promise<Product[]> {
  const { specs, ...rest } = filters;

  const sp = new URLSearchParams();
  // اضافه کردن فیلدهای معمولی
  Object.entries(rest).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => sp.append(key, v));
    } else if (value !== undefined && value !== null) {
      sp.set(key, String(value));
    }
  });
  // اضافه کردن specs
  if (specs) {
    Object.entries(specs).forEach(([key, value]) => {
      sp.set(`specs[${key}]`, value);
    });
  }

  const res = await axios.get<Product[]>('/api/products', { params: sp });
  return res.data;
}
export async function fetchProductFiltersApi(
  categorySlug: string
): Promise<Record<string, string[]>> {
  const res = await axios.get(`/api/products/filters?categorySlug=${categorySlug}`);
  return res.data;
}
