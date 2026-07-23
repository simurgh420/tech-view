// services/productComments/api/mutations.ts
import {
  CreateProductCommentInput,
  UpdateProductCommentInput,
} from '@/lib/validation/productComment';
import axios from 'axios';

export async function createCommentApi(payload: CreateProductCommentInput) {
  const res = await axios.post('/api/product-comments', payload);
  return res.data;
}
export async function updateCommentApi(id: string, payload: UpdateProductCommentInput) {
  const res = await axios.patch(`/api/product-comments/${id}`, payload);
  return res.data;
}
export async function deleteCommentApi(id: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/product-comments/${id}`);
  return res.data;
}
