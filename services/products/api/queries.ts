// services/products/api/queries.ts
import { Product } from '@/types/product';
import axios from 'axios';

export async function fetchProductsApi(): Promise<Product[]> {
  const res = await axios.get('/api/products');
  return res.data;
}

export async function fetchProductBySlugApi(slug: string): Promise<Product> {
  const res = await axios.get(`/api/products/${slug}`);
  return res.data;
}

export async function fetchProductsByCategoryApi(slug: string): Promise<Product[]> {
  const res = await axios.get(`/api/products/category/${slug}`);
  return res.data;
}

export async function fetchProductsByBrandApi(slug: string): Promise<Product[]> {
  const res = await axios.get(`/api/products/brand/${slug}`);
  return res.data;
}

export async function fetchFeaturedProductsApi(): Promise<Product[]> {
  const res = await axios.get('/api/products/featured');
  return res.data;
}

// ✅ فانکشن عمومی برای فیلتر و مرتب‌سازی
export async function fetchFilteredProductsApi(filters: {
  brand?: string;
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}): Promise<Product[]> {
  const res = await axios.get('/api/products', { params: filters });
  return res.data;
}
