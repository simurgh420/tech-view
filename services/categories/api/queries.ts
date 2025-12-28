// services/categories/api/queries.ts

import { Category, CategoryWithProducts } from '@/types/category';
import axios from 'axios';

export async function fetchCategories(): Promise<Category[]> {
  const res = await axios.get<Category[]>('/api/categories');
  return res.data;
}
export async function fetchCategoryBySlug(slug: string): Promise<CategoryWithProducts> {
  const res = await axios.get<CategoryWithProducts>(`/api/categories/${slug}`);
  return res.data;
}
