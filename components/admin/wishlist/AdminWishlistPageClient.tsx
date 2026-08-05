// components/admin/AdminWishlistPageClient.tsx
'use client';

import { useAdminWishlist, useDeleteAdminWishlistItem } from '@/hooks/useAdmin/useAdminWishlist';
import { useNotify } from '@/hooks/useNotify';
import { AdminWishlistTable } from './AdminWishlistTable';

export function AdminWishlistPageClient() {
  const { data: items = [], isLoading, isError } = useAdminWishlist();
  const { mutate: deleteItem, isPending } = useDeleteAdminWishlistItem();
  const notify = useNotify();

  const handleDelete = (id: string) => {
    deleteItem(id, {
      onSuccess: () => notify.success('آیتم با موفقیت حذف شد'),
      onError: () => notify.error('خطا در حذف آیتم'),
    });
  };

  return (
    <AdminWishlistTable
      items={items}
      isLoading={isLoading}
      isError={isError}
      onDelete={handleDelete}
      isDeleting={isPending}
    />
  );
}
