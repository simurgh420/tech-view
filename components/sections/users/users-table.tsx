'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserRoleSelect } from '@/components/button/user-role-select';
import type { UserRole } from '@/types/user';
import { useState } from 'react';
import { UserWithRole } from 'better-auth/plugins';
import { DeleteUserModal } from './DeleteUserModal';
import { BanUserModal } from './BanUserModal';
import { UnbanUserModal } from './UnbanUserModal';
import { UpdateUserModal } from './UpdateUserModal';

// مودال‌های عملیات

export function UsersTable({ users }: { users: UserWithRole[] }) {
  const [filter, setFilter] = useState('');

  const filteredUsers = users.filter(user =>
    `${user.email} ${user.name}`.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="w-full space-y-4" dir="rtl">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="جستجو بر اساس نام یا ایمیل..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="max-w-sm"
          dir="rtl"
        />
        <Button variant="outline">ستون‌ها</Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-gray-700 font-semibold">ID</TableHead>
              <TableHead className="px-6 py-3 text-gray-700 font-semibold">نام</TableHead>
              <TableHead className="px-6 py-3 text-gray-700 font-semibold">ایمیل</TableHead>
              <TableHead className="px-6 py-3 text-center text-gray-700 font-semibold">
                نقش
              </TableHead>
              <TableHead className="px-6 py-3 text-center text-gray-700 font-semibold">
                عملیات
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredUsers.map((user, index) => (
              <TableRow
                key={user.id}
                className={`
                  transition-colors
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  hover:bg-gray-100
                `}
              >
                <TableCell className="px-6 py-3 font-mono text-sm text-gray-700">
                  {user.id.slice(0, 8)}
                </TableCell>
                <TableCell className="px-6 py-3 text-gray-800 font-medium">{user.name}</TableCell>
                <TableCell className="px-6 py-3 text-gray-600">{user.email}</TableCell>
                <TableCell className="px-6 py-3 text-center">
                  <UserRoleSelect userId={user.id} role={user.role as UserRole} />
                </TableCell>
                <TableCell className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* حذف */}
                    {user.role === 'ADMIN' ? (
                      <Button variant="destructive" size="sm" disabled title="ادمین قابل حذف نیست">
                        حذف
                      </Button>
                    ) : (
                      <DeleteUserModal userId={user.id} />
                    )}

                    {/* بن / آن‌بن */}
                    {user.role === 'ADMIN' ? (
                      <Button variant="destructive" size="sm" disabled title="ادمین قابل بن نیست">
                        بن
                      </Button>
                    ) : (
                      <>
                        {!user.banned && <BanUserModal userId={user.id} />}
                        {user.banned && <UnbanUserModal userId={user.id} />}
                      </>
                    )}

                    {/* آپدیت */}
                    {user.role === 'ADMIN' ? (
                      <Button variant="secondary" size="sm" disabled title="ادمین قابل ویرایش نیست">
                        ویرایش
                      </Button>
                    ) : (
                      <UpdateUserModal user={user} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
