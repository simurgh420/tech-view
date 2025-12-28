// services/brands/api/queries.ts

import { Brand, BrandWithProducts } from '@/types/brand';
import axios from 'axios';

// 📌 گرفتن لیست برندها

export async function fetchBrands(): Promise<Brand[]> {
  const res = await axios.get('/api/brands');
  return res.data;
}

// 📌 گرفتن یک برند با slug

export async function fetchBrandBySlug(slug: string): Promise<BrandWithProducts> {
  const res = await axios.get(`/api/brands/${slug}`);
  return res.data;
}
