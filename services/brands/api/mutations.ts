// services/brands/api/mutations.ts
import axios from 'axios';
import { Brand } from '@/app/generated/prisma/client';
import { CreateBrandInput, EditBrandInput } from '@/lib/validation/brand';

export async function createBrandRequestApi(payload: CreateBrandInput): Promise<Brand> {
  const res = await axios.post('/api/brands', payload);
  return res.data;
}

export async function updateBrandRequestApi(
  slug: string,
  payload: Partial<EditBrandInput>
): Promise<Brand> {
  const res = await axios.patch(`/api/brands/${slug}`, payload);
  return res.data;
}

export async function deleteBrandRequestApi(slug: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/brands/${slug}`);
  return res.data;
}
