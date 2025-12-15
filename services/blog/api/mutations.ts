// services/blog/api/mutations.ts

import { BlogFormType } from '@/components/sections/blog/BlogForm';
import { BlogPost } from '@/types/blog';
import axios from 'axios';

export async function createBlog(data: BlogFormType): Promise<BlogPost> {
  const { data: res } = await axios.post('/api/blog', data);
  return res;
}

export async function updateBlog(slug: string, data: BlogFormType): Promise<BlogPost> {
  const { data: res } = await axios.put(`/api/blog/${slug}`, data);
  return res;
}

export async function deleteBlog(slug: string): Promise<unknown> {
  const { data } = await axios.delete(`/api/blog/${slug}`);
  return data;
}
