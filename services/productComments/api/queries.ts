// services/productComments/api/queries.ts
import { CommentNode } from '@/services/productComments/db/queries';
import axios from 'axios';

export async function fetchCommentsByProductApi(slug: string): Promise<CommentNode[]> {
  const res = await axios.get(`/api/product-comments?product=${slug}`);
  return res.data;
}
