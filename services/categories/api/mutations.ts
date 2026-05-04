// services/categories/api/mutations.ts
import { Category } from '@/app/generated/prisma/client';
import { CreateCategoryInput, EditCategoryInput } from '@/lib/validation/category';
import axios from 'axios';

export async function createCategoryRequestApi(payload: CreateCategoryInput): Promise<Category> {
  const res = await axios.post<Category>('/api/categories', payload);
  return res.data;
}

export async function updateCategoryRequestApi(
  slug: string,
  payload: Partial<EditCategoryInput>
): Promise<Category> {
  const res = await axios.patch(`/api/categories/${slug}`, payload);
  return res.data;
}

export async function deleteCategoryRequestApi(slug: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/categories/${slug}`);
  return res.data;
}
