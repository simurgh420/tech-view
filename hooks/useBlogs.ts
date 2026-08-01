// hooks/useBlogs.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { BlogListResponse, BlogPost } from '@/types/blog';

import { fetchAdminBlogsApi, fetchBlogBySlugApi, fetchBlogsApi } from '@/services/blog/api/queries';
import { createBlogApi, deleteBlogApi, updateBlogApi } from '@/services/blog/api/mutations';
import { CreateBlogPayload, UpdateBlogInput } from '@/lib/validation/blog';

/** کلیدهای کوئری متمرکز برای بلاگ */
export const blogKeys = {
  all: ['blogs'] as const,
  list: (page: number, pageSize: number) => ['blogs', page, pageSize] as const,
  detail: (slug: string) => ['blog', slug] as const,
  admin: ['admin', 'blogs'] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** لیست صفحه‌بندی‌شده‌ی پست‌های بلاگ */
export function useGetBlogs(page = 1, pageSize = 10) {
  return useQuery<BlogListResponse>({
    queryKey: blogKeys.list(page, pageSize),
    queryFn: () => fetchBlogsApi(page, pageSize),
  });
}

/** یک پست بلاگ بر اساس اسلاگ */
export function useGetBlog(slug: string) {
  return useQuery<BlogPost>({
    queryKey: blogKeys.detail(slug),
    queryFn: () => fetchBlogBySlugApi(slug),
    enabled: !!slug,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

/** ایجاد پست جدید */
export function useCreateBlog() {
  const qc = useQueryClient();

  return useMutation<BlogPost, Error, CreateBlogPayload>({
    mutationFn: createBlogApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
  
} /** لیست پست‌ها برای پنل ادمین (شامل draft ها هم می‌شه) */
export function useGetAdminBlogs() {
  return useQuery({
    queryKey: blogKeys.admin,
    queryFn: fetchAdminBlogsApi,
  });
}

/** ویرایش پست — اگر اسلاگ تغییر کند، کش اسلاگ قدیمی هم invalidate می‌شود */
export function useUpdateBlog(slug: string) {
  const qc = useQueryClient();

  return useMutation<BlogPost, Error, UpdateBlogInput>({
    mutationFn: data => updateBlogApi(slug, data),
    onSuccess: updatedPost => {
      qc.invalidateQueries({ queryKey: blogKeys.all });
      qc.invalidateQueries({ queryKey: blogKeys.detail(updatedPost.slug) });

      if (updatedPost.slug !== slug) {
        qc.invalidateQueries({ queryKey: blogKeys.detail(slug) }); // اسلاگ قدیمی
      }
    },
  });
}

/**
 * حذف پست — Optimistic
 * نکته: چون useGetBlogs صفحه‌بندی‌شده است (کلید واقعی ['blogs', page, pageSize] است، نه ['blogs']),
 * برای آپدیت optimistic باید همه‌ی صفحات کش‌شده را با setQueriesData (partial match) پیدا و آپدیت کرد؛
 * getQueryData/setQueryData با کلید ناقص ['blogs'] هیچ‌وقت با این کلیدها match نمی‌شود.
 */
export function useDeleteBlog() {
  const qc = useQueryClient();

  return useMutation<
    { success: boolean },
    Error,
    string,
    { prevBlogsEntries: [readonly unknown[], BlogListResponse | undefined][] }
  >({
    mutationFn: deleteBlogApi,

    onMutate: async slug => {
      await qc.cancelQueries({ queryKey: blogKeys.all });

      const prevBlogsEntries = qc.getQueriesData<BlogListResponse>({ queryKey: blogKeys.all });

      qc.setQueriesData<BlogListResponse>({ queryKey: blogKeys.all }, old =>
        old ? { ...old, items: old.items.filter(b => b.slug !== slug) } : old
      );

      return { prevBlogsEntries };
    },

    onError: (_err, _slug, context) => {
      context?.prevBlogsEntries.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}
