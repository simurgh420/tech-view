// services/comments/api/queries.ts
import { CommentSafe } from '@/types/comment';
import axios from 'axios';

export async function fetchCommentsApi(postId: string): Promise<CommentSafe[]> {
  const { data } = await axios.get(`/api/posts/${postId}/comments`);
  return data;
}

//برای داشبورد
// export async function fetchAllCommentsWithPost(): Promise<
//   (CommentSafe & { post: { id: string; slug: string; title: string } })[]
// > {
//   const { data } = await axios.get(`/api/dashboard/comments`);
//   return data;
// }
