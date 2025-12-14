// hooks/useBlogs.ts
'use client';

import axios from 'axios';
import { BlogFormType } from '@/components/sections/blog/BlogForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useBlogs() {
  const queryClient = useQueryClient();

  // 📌 گرفتن لیست بلاگ‌ها
  const useGetBlogs = (page = 1, pageSize = 10) =>
    useQuery({
      queryKey: ['blogs', page, pageSize],
      queryFn: async () => {
        const { data } = await axios.get(`/api/blog`, {
          params: { page, pageSize },
        });
        return data;
      },
    });

  // 📌 گرفتن یک بلاگ
  const useGetBlog = (slug: string) =>
    useQuery({
      queryKey: ['blog', slug],
      queryFn: async () => {
        const { data } = await axios.get(`/api/blog/${slug}`);
        return data;
      },
      enabled: !!slug,
    });

  // 📌 ایجاد بلاگ
  const useCreateBlog = () =>
    useMutation({
      mutationFn: async (data: BlogFormType) => {
        const { data: res } = await axios.post('/api/blog', data);
        return res;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
      },
    });

  // 📌 ویرایش بلاگ
  const useUpdateBlog = (slug: string) =>
    useMutation({
      mutationFn: async (data: BlogFormType) => {
        const { data: res } = await axios.put(`/api/blog/${slug}`, data);
        return res;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
        queryClient.invalidateQueries({ queryKey: ['blog', slug] });
      },
    });

  // 📌 حذف بلاگ
  const useDeleteBlog = () =>
    useMutation({
      mutationFn: async (slug: string) => {
        const { data } = await axios.delete(`/api/blog/${slug}`);
        return data;
      },
      onSuccess: () => {
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
