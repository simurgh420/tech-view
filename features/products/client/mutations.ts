// services/products/api/mutations.ts

import { CreateProductPayload, UpdateProductInput } from '@/features/products/schemas/product';
import { Product } from '@/features/products/types/product';
import axios from 'axios';

export async function createProductApi(payload: CreateProductPayload): Promise<Product> {
  const res = await axios.post<Product>('/api/products', payload);
  return res.data;
}
export async function updateProductApi(
  slug: string,
  payload: UpdateProductInput
): Promise<Product> {
  const res = await axios.patch<Product>(`/api/products/${slug}`, payload);
  return res.data;
}
export async function deleteProductApi(slug: string): Promise<{ success: boolean }> {
  const res = await axios.delete<{ success: boolean }>(`/api/products/${slug}`);
  return res.data;
}
