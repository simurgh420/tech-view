// services/blog/api/queries.ts
import { BlogListResponse, BlogPost } from '@/types/blog';
import axios from 'axios';

export async function fetchBlogsApi(page = 1, pageSize = 10): Promise<BlogListResponse> {
  const { data } = await axios.get('/api/blog', { params: { page, pageSize } });
  return data;
}

export async function fetchBlogBySlugApi(slug: string): Promise<BlogPost> {
  const { data } = await axios.get(`/api/blog/${slug}`);
  return data;
}
