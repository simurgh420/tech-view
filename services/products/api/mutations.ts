// services/products/api/mutations.ts

import { Product, ProductPayload } from '@/types/product';
import axios from 'axios';

export async function createProductRequest(payload: ProductPayload): Promise<Product> {
  const res = await axios.post('/api/products', payload);
  return res.data;
}
export async function updateProductRequest(
  slug: string,
  payload: Partial<ProductPayload>
): Promise<Product> {
  const res = await axios.patch(`/api/products/${slug}`, payload);
  return res.data;
}
export async function deleteProductRequest(slug: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/products/${slug}`);
  return res.data;
}
