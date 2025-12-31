'use client';

import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/types/user';
import { UserRoleBadge } from './user-role-badge';
import { UserRowActions } from './user-row-actions';

export const columns: ColumnDef<User>[] = [
  // نمایش از راست به چپ: عملیات | نقش | ایمیل | نام
  {
    id: 'actions',
    header: () => <div className="text-sm font-medium">عملیات</div>,
    cell: ({ row }) => <UserRowActions user={row.original} />,
    meta: { minWidth: 80, cellClass: 'text-left' },
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: () => <div className="text-sm font-medium">نقش</div>,
    cell: ({ row }) => <UserRoleBadge role={row.original.role} />,
    meta: { minWidth: 110 },
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: () => <div className="text-sm font-medium">ایمیل</div>,
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 truncate max-w-[220px]">{row.getValue('email')}</div>
    ),
    meta: { minWidth: 200, maxWidth: 320 },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <div className="text-sm font-medium">نام</div>,
    cell: ({ row }) => (
      <div className="text-sm font-medium text-gray-800">{row.getValue('name') ?? '-'}</div>
    ),
    meta: { minWidth: 160, maxWidth: 260 },
  },
];
