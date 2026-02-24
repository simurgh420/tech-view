// services/reviews/api/mutations.ts

import { Review } from '@/app/generated/prisma/client';
import {  ReviewPayload } from '@/types/review';
import axios from 'axios';

export async function createReviewApi(payload: ReviewPayload): Promise<Review> {
  const res = await axios.post('/api/reviews', payload);
  return res.data;
}
export async function updateReviewApi(
  id: string,
  payload: Partial<ReviewPayload>
): Promise<Review> {
  const res = await axios.put(`/api/reviews/${id}`, payload);
  return res.data;
}
export async function deleteReviewApi(id: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/reviews/${id}`);
  return res.data;
}
