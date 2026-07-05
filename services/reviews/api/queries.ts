// services/reviews/api/queries.ts
import { ReviewWithAuthor } from '@/types/review';
import axios from 'axios';

export async function fetchReviewsByProductApi(slug: string): Promise<ReviewWithAuthor[]> {
  const res = await axios.get(`/api/reviews?product=${slug}`);
  return res.data;
}
