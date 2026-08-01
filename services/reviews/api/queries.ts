// services/reviews/api/queries.ts
import { AdminReviewItem, ReviewWithAuthor } from '@/types/review';
import axios from 'axios';

export async function fetchReviewsByProductApi(slug: string): Promise<ReviewWithAuthor[]> {
  const res = await axios.get(`/api/reviews?product=${slug}`);
  return res.data;
}

export async function fetchAdminReviewsApi(): Promise<AdminReviewItem[]> {
  const res = await axios.get('/api/reviews/admin');
  return res.data;
}
