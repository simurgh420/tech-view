// services/blog/api/mutations.ts
import { BlogPost } from '@/types/blog';
import axios from 'axios';
import { CreateBlogInput } from '../db/schemas/createBlog.schema';
import { UpdateBlogInput } from '../db/schemas/updateBlog.schema';

export async function createBlogApi(data: CreateBlogInput): Promise<BlogPost> {
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
