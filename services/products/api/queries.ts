// services/products/api/queries.ts

import axios from 'axios';

// 📌 گرفتن لیست محصولات
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchProducts(params: Record<string, any>) {
  const res = await axios.get('/api/products', { params });
  return res.data;
}
// 📌 گرفتن یک محصول با slug

export async function fetchProductBySlug(slug: string) {
  const res = await axios.get(`/api/products/${slug}`);
  return res.data;
}
