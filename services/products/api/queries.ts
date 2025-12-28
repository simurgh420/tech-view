// services/products/api/queries.ts

import { Product, ProductListResponse } from '@/types/product';
import axios from 'axios';

// 📌 گرفتن لیست محصولات

export async function fetchProducts(
  params: Record<string, string | number | boolean>
): Promise<ProductListResponse> {
  const res = await axios.get('/api/products', { params });
  return res.data;
}
// 📌 گرفتن یک محصول با slug

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const res = await axios.get(`/api/products/${slug}`);
  return res.data;
}
