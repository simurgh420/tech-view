// hooks/useBlogs.ts
'use client';
import { BlogFormType } from '@/components/sections/blog/BlogForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BlogListResponse, BlogPost } from '@/types/blog';
import { fetchBlogs, fetchBlogBySlug } from '@/services/blog/api/queries';
import { createBlog, updateBlog, deleteBlog } from '@/services/blog/api/mutations';
export function useBlogs() {
  const queryClient = useQueryClient();

  // 📌 گرفتن لیست بلاگ‌ها
  const useGetBlogs = (page = 1, pageSize = 10) =>
    useQuery<BlogListResponse>({
      queryKey: ['blogs', page, pageSize],
      queryFn: async () => fetchBlogs(page, pageSize),
    });

  // 📌 گرفتن یک بلاگ
  const useGetBlog = (slug: string) =>
    useQuery<BlogPost>({
      queryKey: ['blog', slug],
      queryFn: async () => fetchBlogBySlug(slug),
      enabled: !!slug,
    });

  // 📌 ایجاد بلاگ
  const useCreateBlog = () =>
    useMutation<BlogPost, Error, BlogFormType>({
      mutationFn: createBlog,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
      },
      onError: err => console.error('خطا در ایجاد بلاگ:', err),
    });

  // 📌 ویرایش بلاگ
  const useUpdateBlog = (slug: string) =>
    useMutation<BlogPost, Error, BlogFormType>({
      mutationFn: async (data: BlogFormType) => updateBlog(slug, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
        queryClient.invalidateQueries({ queryKey: ['blog', slug] });
      },
      onError: err => console.error('خطا در ویرایش بلاگ:', err),
    });

  // 📌 حذف بلاگ
  const useDeleteBlog = () =>
    useMutation<unknown, Error, string, { prevBlogs?: BlogListResponse }>({
      mutationFn: deleteBlog,
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
