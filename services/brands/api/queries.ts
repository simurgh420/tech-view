// services/brands/api/queries.ts
import axios from 'axios';
import { Brand } from '@/types/brand';

export async function fetchBrandsApi(): Promise<Brand[]> {
  const res = await axios.get('/api/brands');
  return res.data;
}

export async function fetchBrandBySlugApi(slug: string): Promise<Brand> {
  const res = await axios.get(`/api/brands/${slug}`);
  return res.data;
}
