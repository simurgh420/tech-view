// services/brands/api/mutations.ts
import axios from 'axios';
import { BrandPayload } from '@/types/brand';
import { Brand } from '@/app/generated/prisma/client';

export async function createBrandRequestApi(payload: BrandPayload): Promise<Brand> {
  const res = await axios.post('/api/brands', payload);
  return res.data;
}

export async function updateBrandRequestApi(
  slug: string,
  payload: Partial<BrandPayload>
): Promise<Brand> {
  const res = await axios.patch(`/api/brands/${slug}`, payload);
  return res.data;
}

export async function deleteBrandRequestApi(slug: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/brands/${slug}`);
  return res.data;
}
