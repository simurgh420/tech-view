// services/brands/api/queries.ts
import axios from 'axios';
import { Brand } from '@/types/brand';

export async function fetchBrands(): Promise<Brand[]> {
  const res = await axios.get('/api/brands');
  return res.data;
}

export async function fetchBrandBySlug(slug: string): Promise<Brand> {
  const res = await axios.get(`/api/brands/${slug}`);
  return res.data;
}
