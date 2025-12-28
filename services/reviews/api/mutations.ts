// services/reviews/api/mutations.ts

import { Review, ReviewPayload } from '@/types/review';
import axios from 'axios';

export async function createReview(payload: ReviewPayload): Promise<Review> {
  const res = await axios.post('/api/reviews', payload);
  return res.data;
}
export async function updateReview(id: string, payload: ReviewPayload): Promise<Review> {
  const res = await axios.put(`/api/reviews/${id}`, payload);
  return res.data;
}
export async function deleteReview(id: string): Promise<{ success: boolean }> {
  const res = await axios.delete(`/api/reviews/${id}`);
  return res.data;
}
