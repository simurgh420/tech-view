// hooks/useBlogs.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { BlogListResponse, BlogPayload, BlogPost, UpdateBlogData } from '@/types/blog';

import { fetchBlogBySlugApi, fetchBlogsApi } from '@/services/blog/api/queries';
import { createBlogApi, deleteBlogApi, updateBlogApi } from '@/services/blog/api/mutations';

export function useBlogs() {
  const qc = useQueryClient();

  const useGetBlogs = (page = 1, pageSize = 10) =>
    useQuery<BlogListResponse>({
      queryKey: ['blogs', page, pageSize],
      queryFn: () => fetchBlogsApi(page, pageSize),
    });

  const useGetBlog = (slug: string) =>
    useQuery<BlogPost>({
      queryKey: ['blog', slug],
      queryFn: () => fetchBlogBySlugApi(slug),
      enabled: !!slug,
    });

  const useCreateBlog = () =>
    useMutation<BlogPost, Error, BlogPayload>({
      mutationFn: createBlogApi,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['blogs'] });
      },
    });

  const useUpdateBlog = (slug: string) =>
    useMutation<BlogPost, Error, UpdateBlogData>({
      mutationFn: data => updateBlogApi(slug, data),
      onSuccess: updatedPost => {
        qc.invalidateQueries({ queryKey: ['blogs'] });
        qc.invalidateQueries({ queryKey: ['blog', updatedPost.slug] });

        if (updatedPost.slug !== slug) {
          qc.invalidateQueries({ queryKey: ['blog', slug] }); // ← اسلاگ قدیمی
        }
      },
    });

  const useDeleteBlog = () =>
    useMutation<unknown, Error, string, { prevBlogs?: BlogListResponse }>({
      mutationFn: deleteBlogApi,
      onMutate: async slug => {
        await qc.cancelQueries({ queryKey: ['blogs'] });
        const prevBlogs = qc.getQueryData<BlogListResponse>(['blogs']);
        qc.setQueryData<BlogListResponse>(['blogs'], old =>
          old ? { ...old, items: old.items.filter(b => b.slug !== slug) } : old
        );
        return { prevBlogs };
      },
      onError: (_err, _slug, context) => {
        if (context?.prevBlogs) {
          qc.setQueryData(['blogs'], context.prevBlogs);
        }
      },
      onSettled: () => {
        qc.invalidateQueries({ queryKey: ['blogs'] });
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
