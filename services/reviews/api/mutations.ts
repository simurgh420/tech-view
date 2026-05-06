// services/reviews/api/mutations.ts

import { Review } from '@/app/generated/prisma/client';
import { CreateReviewInput, UpdateReviewInput } from '@/lib/validation/review';
import axios from 'axios';

export async function createReviewApi(payload: CreateReviewInput): Promise<Review> {
  const res = await axios.post('/api/reviews', payload);
  return res.data;
}
export async function updateReviewApi(id: string, payload: UpdateReviewInput): Promise<Review> {
  const res = await axios.patch(`/api/reviews/${id}`, payload);
  return res.data;
}
export async function deleteReviewApi(id: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/reviews/${id}`);
  return res.data;
}
