// services/reviews/api/queries.ts

import { Review } from '@/app/generated/prisma/client';
import axios from 'axios';

export async function fetchReviewsByProductApi(slug: string): Promise<Review[]> {
  const res = await axios.get(`/api/reviews?product=${slug}`);
  return res.data;
}
