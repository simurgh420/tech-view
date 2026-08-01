// services/productComments/api/queries.ts
import { AdminProductCommentItem, CommentNode } from '@/types/CommentProduct';
import axios from 'axios';

export async function fetchCommentsByProductApi(slug: string): Promise<CommentNode[]> {
  const res = await axios.get(`/api/product-comments?product=${slug}`);
  return res.data;
}
export async function fetchAdminProductCommentsApi(): Promise<AdminProductCommentItem[]> {
  const res = await axios.get('/api/product-comments/admin');
  return res.data;
}
