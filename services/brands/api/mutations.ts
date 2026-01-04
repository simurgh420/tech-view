// services/brands/api/mutations.ts
import axios from 'axios';
import { Brand, BrandPayload } from '@/types/brand';

export async function createBrandRequest(payload: BrandPayload): Promise<Brand> {
  const res = await axios.post('/api/brands', payload);
  return res.data;
}

export async function updateBrandRequest(
  slug: string,
  payload: Partial<BrandPayload>
): Promise<Brand> {
  const res = await axios.patch(`/api/brands/${slug}`, payload);
  return res.data;
}

export async function deleteBrandRequest(slug: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/brands/${slug}`);
  return res.data;
}
