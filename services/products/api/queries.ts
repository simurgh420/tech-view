// services/products/api/queries.ts

import { Product } from '@/types/product';
import axios from 'axios';
export async function fetchProducts(): Promise<Product[]> {
  const res = await axios.get('/api/products');
  return res.data;
}
export async function fetchProductBySlug(slug: string): Promise<Product> {
  const res = await axios.get(`/api/products/${slug}`);
  return res.data;
}
export async function fetchProductsByCategory(slug: string): Promise<Product[]> {
  const res = await axios.get(`/api/products/category/${slug}`);
  return res.data;
}
export async function fetchProductsByBrand(slug: string): Promise<Product[]> {
  const res = await axios.get(`/api/products/brand/${slug}`);
  return res.data;
}
export async function fetchFeaturedProducts(): Promise<Product[]> {
  const res = await axios.get('/api/products/featured');
  return res.data;
}
