// services/blog/api/mutations.ts
import { BlogPayload, BlogPost, UpdateBlogData } from '@/types/blog';
import axios from 'axios';

export async function createBlog(data: BlogPayload): Promise<BlogPost> {
  const { data: res } = await axios.post('/api/blog', data);
  return res;
}

export async function updateBlog(slug: string, data: UpdateBlogData): Promise<BlogPost> {
  const { data: res } = await axios.put(`/api/blog/${slug}`, data);
  return res;
}

export async function deleteBlog(slug: string): Promise<unknown> {
  const { data } = await axios.delete(`/api/blog/${slug}`);
  return data;
}
