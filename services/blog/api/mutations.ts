// services/blog/api/mutations.ts
import { BlogPayload, BlogPost, UpdateBlogData } from '@/types/blog';
import axios from 'axios';

export async function createBlogApi(data: BlogPayload): Promise<BlogPost> {
  const { data: res } = await axios.post('/api/blog', data);
  return res;
}

export async function updateBlogApi(slug: string, data: UpdateBlogData): Promise<BlogPost> {
  const { data: res } = await axios.put(`/api/blog/${slug}`, data);
  return res;
}

export async function deleteBlogApi(slug: string): Promise<unknown> {
  const { data } = await axios.delete(`/api/blog/${slug}`);
  return data;
}
