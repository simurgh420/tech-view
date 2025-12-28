// services/reviews/api/queries.ts

import { Review } from '@/types/review';
import axios from 'axios';

export async function fetchReviewsByProduct(slug: string): Promise<Review[]> {
  const res = await axios.get(`/api/reviews?product=${slug}`);
  return res.data;
}
