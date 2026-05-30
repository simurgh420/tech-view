// services/blog/api/mutations.ts
import { CreateBlogPayload, UpdateBlogInput } from '@/lib/validation/blog';
import { BlogPost } from '@/types/blog';
import axios from 'axios';

export async function createBlogApi(data: CreateBlogPayload): Promise<BlogPost> {
  const { data: res } = await axios.post('/api/blog', data);
  return res;
}

export async function updateBlogApi(slug: string, data: UpdateBlogInput): Promise<BlogPost> {
  const { data: res } = await axios.put(`/api/blog/${slug}`, data);
  return res;
}

export async function deleteBlogApi(slug: string): Promise<{ success: boolean }> {
  const { data } = await axios.delete(`/api/blog/${slug}`);
  return data;
}
