// hooks/useAdmin/useAdminWishlist.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminWishlistApi } from '@/services/wishlist/api/admin';
import { deleteWishlistItemApi } from '@/services/wishlist/api/mutations';
import { AdminWishlistItem } from '@/types/wishlist';

/** کلید کوئری متمرکز برای پنل ادمین ویش‌لیست */
export const adminWishlistKeys = {
  all: ['admin-wishlist'] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

export function useAdminWishlist() {
  return useQuery<AdminWishlistItem[]>({
    queryKey: adminWishlistKeys.all,
    queryFn: fetchAdminWishlistApi,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

export function useDeleteAdminWishlistItem() {
  const qc = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id: string) => deleteWishlistItemApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminWishlistKeys.all });
    },
  });
}
