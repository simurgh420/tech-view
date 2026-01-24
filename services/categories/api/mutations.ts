// services/categories/api/mutations.ts
import { Category, CategoryPayload } from '@/types/category';
import axios from 'axios';

export async function createCategoryRequestApi(payload: CategoryPayload): Promise<Category> {
  const res = await axios.post('/api/categories', payload);
  return res.data;
}

export async function updateCategoryRequestApi(
  slug: string,
  payload: Partial<CategoryPayload>
): Promise<Category> {
  const res = await axios.patch(`/api/categories/${slug}`, payload);
  return res.data;
}

export async function deleteCategoryRequestApi(slug: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/categories/${slug}`);
  return res.data;
}
