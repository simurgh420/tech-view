// services/categories/api/queries.ts
import { Category } from '@/app/generated/prisma/client';
import axios from 'axios';

export async function fetchCategoriesApi(): Promise<Category[]> {
  const res = await axios.get('/api/categories');
  return res.data;
}

export async function fetchCategoryBySlugApi(slug: string): Promise<Category> {
  const res = await axios.get(`/api/categories/${slug}`);
  return res.data;
}
