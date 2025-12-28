// services/products/api/mutations.ts

import { Product, ProductPayload } from '@/types/product';
import axios from 'axios';

export async function createProductَApi(payload: ProductPayload): Promise<Product> {
  const res = await axios.post('/api/products', payload);
  return res.data;
}
export async function updateProductApi(
  slug: string,
  payload: Partial<ProductPayload>
): Promise<Product> {
  const res = await axios.patch(`/api/products/${slug}`, payload);
  return res.data;
}
export async function deleteProductApi(slug: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/products/${slug}`);
  return res.data;
}
