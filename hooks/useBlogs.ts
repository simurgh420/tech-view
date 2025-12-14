// hooks/useBlogs.ts
'use client';

import axios from 'axios';
import { BlogFormType } from '@/components/sections/blog/BlogForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BlogListResponse, BlogPost } from '@/types/blog';

export function useBlogs() {
  const queryClient = useQueryClient();

  // 📌 گرفتن لیست بلاگ‌ها
  const useGetBlogs = (page = 1, pageSize = 10) =>
    useQuery<BlogListResponse>({
      queryKey: ['blogs', page, pageSize],
      queryFn: async () => {
        const { data } = await axios.get<BlogListResponse>(`/api/blog`, {
          params: { page, pageSize },
        });
        return data;
      },
    });

  // 📌 گرفتن یک بلاگ
  const useGetBlog = (slug: string) =>
    useQuery<BlogPost>({
      queryKey: ['blog', slug],
      queryFn: async () => {
        const { data } = await axios.get<BlogPost>(`/api/blog/${slug}`);
        return data;
      },
      enabled: !!slug,
    });

  // 📌 ایجاد بلاگ
  const useCreateBlog = () =>
    useMutation<BlogPost, Error, BlogFormType>({
      mutationFn: async (data: BlogFormType) => {
        const { data: res } = await axios.post<BlogPost>('/api/blog', data);
        return res;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
      },
      onError: err => console.error('خطا در ایجاد بلاگ:', err),
    });

  // 📌 ویرایش بلاگ
  const useUpdateBlog = (slug: string) =>
    useMutation<BlogPost, Error, BlogFormType>({
      mutationFn: async (data: BlogFormType) => {
        const { data: res } = await axios.put<BlogPost>(`/api/blog/${slug}`, data);
        return res;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
        queryClient.invalidateQueries({ queryKey: ['blog', slug] });
      },
      onError: err => console.error('خطا در ویرایش بلاگ:', err),
    });

  // 📌 حذف بلاگ
  const useDeleteBlog = () =>
    useMutation<unknown, Error, string, { prevBlogs?: BlogListResponse }>({
      mutationFn: async (slug: string) => {
        const { data } = await axios.delete(`/api/blog/${slug}`);
        return data;
      },
      onMutate: async (slug: string) => {
        await queryClient.cancelQueries({ queryKey: ['blogs'] });
        const prevBlogs = queryClient.getQueryData<BlogListResponse>(['blogs']);
        queryClient.setQueryData<BlogListResponse>(['blogs'], old =>
          old ? { ...old, items: old.items.filter(b => b.slug !== slug) } : old
        );
        return { prevBlogs };
      },
      onError: (_err, _slug, context) => {
        if (context?.prevBlogs) {
          queryClient.setQueryData(['blogs'], context.prevBlogs);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
      },
    });

  return {
    useGetBlogs,
    useGetBlog,
    useCreateBlog,
    useUpdateBlog,
    useDeleteBlog,
  };
}
