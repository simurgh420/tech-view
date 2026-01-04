// hooks/useBlogs.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BlogListResponse, BlogPayload, BlogPost, UpdateBlogData } from '@/types/blog';
import { fetchBlogs, fetchBlogBySlug } from '@/services/blog/api/queries';
import { createBlog, updateBlog, deleteBlog } from '@/services/blog/api/mutations';
import { useRouter } from 'next/navigation';

export function useBlogs() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const useGetBlogs = (page = 1, pageSize = 10) =>
    useQuery<BlogListResponse>({
      queryKey: ['blogs', page, pageSize],
      queryFn: () => fetchBlogs(page, pageSize),
    });

  const useGetBlog = (slug: string) =>
    useQuery<BlogPost>({
      queryKey: ['blog', slug],
      queryFn: () => fetchBlogBySlug(slug),
      enabled: !!slug,
    });

  const useCreateBlog = () =>
    useMutation<BlogPost, Error, BlogPayload>({
      mutationFn: createBlog,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
      },
    });

  const useUpdateBlog = (slug: string) =>
    useMutation<BlogPost, Error, UpdateBlogData>({
      mutationFn: data => updateBlog(slug, data),
      onSuccess: updatedPost => {
        queryClient.invalidateQueries({ queryKey: ['blogs'] });

        // invalidate slug جدید
        queryClient.invalidateQueries({ queryKey: ['blog', updatedPost.slug] });

        if (updatedPost.slug !== slug) {
          router.push(`/blog/${updatedPost.slug}`);
        }
      },
    });

  const useDeleteBlog = () =>
    useMutation<unknown, Error, string, { prevBlogs?: BlogListResponse }>({
      mutationFn: deleteBlog,
      onMutate: async slug => {
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
