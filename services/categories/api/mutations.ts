// services/categories/api/mutations.ts
import { Category } from '@/app/generated/prisma/client';
import { CreateCategoryInput, EditCategoryInput } from '@/lib/validation/category';
import axios from 'axios';
export interface AddCategoryAttributeInput {
  categorySlug: string;
  attributeId: string;
  isRequired?: boolean;
  isFilterable?: boolean;
}

export async function createCategoryRequestApi(payload: CreateCategoryInput): Promise<Category> {
  const res = await axios.post<Category>('/api/categories', payload);
  return res.data;
}

export async function updateCategoryRequestApi(
  slug: string,
  payload: Partial<EditCategoryInput>
): Promise<Category> {
  const res = await axios.patch(`/api/categories/${slug}`, payload);
  return res.data;
}

export async function deleteCategoryRequestApi(slug: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/categories/${slug}`);
  return res.data;
}

export async function addCategoryAttributeApi(input: AddCategoryAttributeInput) {
  const { categorySlug, ...body } = input;

  const response = await axios.post(`/api/admin/categories/${categorySlug}/attributes`, body);

  return response.data;
}

export interface UpdateCategoryAttributeInput {
  categorySlug: string;
  id: string;
  data: {
    isRequired?: boolean;
    isFilterable?: boolean;
    order?: number;
  };
}

export async function updateCategoryAttributeApi(input: UpdateCategoryAttributeInput) {
  const response = await axios.patch(`/api/admin/categories/${input.categorySlug}/attributes`, {
    id: input.id,
    ...input.data,
  });

  return response.data;
}

export async function deleteCategoryAttributeApi(input: { categorySlug: string; id: string }) {
  const response = await axios.delete(
    `/api/admin/categories/${input.categorySlug}/attributes?id=${input.id}`
  );

  return response.data;
}

export async function reorderCategoryAttributesApi(input: {
  categorySlug: string;
  items: Array<{
    id: string;
    order: number;
  }>;
}) {
  const response = await axios.patch(`/api/admin/categories/${input.categorySlug}/attributes`, {
    action: 'reorder',
    items: input.items,
  });

  return response.data;
}
