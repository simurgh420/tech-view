// hooks/useAdminComments.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllCommentsAdminApi } from '@/services/comments/api/queries';
import { deleteCommentApi } from '@/services/comments/api/mutations';
import { AdminComment } from '@/types/comment';

/** کلید کوئری متمرکز برای پنل ادمین کامنت‌ها */
export const adminCommentKeys = {
  all: ['admin-comments'] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** لیست کامل کامنت‌ها برای پنل ادمین */
export function useGetAdminComments() {
  return useQuery<AdminComment[]>({
    queryKey: adminCommentKeys.all,
    queryFn: fetchAllCommentsAdminApi,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

/** حذف یک کامنت از پنل ادمین */
export function useDeleteAdminComment() {
  const qc = useQueryClient();

  return useMutation<{ success: boolean } | void, Error, string>({
    mutationFn: (commentId: string) => deleteCommentApi(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminCommentKeys.all });
    },
  });
}
