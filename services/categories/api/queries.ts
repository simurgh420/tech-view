// services/categories/api/queries.ts
import axios from 'axios';
import { Category } from '@/types/category';

export async function fetchCategories(): Promise<Category[]> {
  const res = await axios.get('/api/categories');
  return res.data;
}

export async function fetchCategoryBySlug(slug: string): Promise<Category> {
  const res = await axios.get(`/api/categories/${slug}`);
  return res.data;
}
