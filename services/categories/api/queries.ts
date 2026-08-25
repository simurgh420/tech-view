// services/categories/api/queries.ts
import { Category } from '@/app/generated/prisma/client';
import { AdminAttribute, CategoryAttributeOption } from '@/types/category';
import axios from 'axios';

export async function fetchCategoriesApi(): Promise<Category[]> {
  const res = await axios.get('/api/categories');
  return res.data;
}

export async function fetchCategoryBySlugApi(slug: string): Promise<Category> {
  const res = await axios.get(`/api/categories/${slug}`);
  return res.data;
}
export async function fetchCategoryAttributesApi(
  categorySlug: string
): Promise<CategoryAttributeOption[]> {
  const response = await axios.get<CategoryAttributeOption[]>(
    `/api/admin/categories/${categorySlug}/attributes`
  );

  return response.data;
}
export async function fetchAdminAttributesApi(): Promise<AdminAttribute[]> {
  const response = await axios.get<AdminAttribute[]>('/api/admin/attributes');

  return response.data;
}
