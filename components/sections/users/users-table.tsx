'use client';

import { useState } from 'react';

import { UserWithRole } from 'better-auth/plugins';

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

import { DeleteUserModal } from './DeleteUserModal';
import { BanUserModal } from './BanUserModal';
import { UpdateUserModal } from './UpdateUserModal';

import { canManageUser } from '@/lib/role-rank';
import { UnbanUserModal } from './UnbanUserModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type UsersTableProps = {
  users: UserWithRole[];
  currentUserId: string;
  currentUserRole: UserRole;
};

export function UsersTable({ users, currentUserId, currentUserRole }: UsersTableProps) {
  const [filter, setFilter] = useState('');

  const filteredUsers = users.filter(user =>
    `${user.email} ${user.name}`.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4" dir="rtl">
      {/* Toolbar */}
      <Input
        placeholder="جستجو بر اساس نام یا ایمیل..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="max-w-sm"
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3 font-semibold text-right">نام</TableHead>

              <TableHead className="px-6 py-3 font-semibold text-right">ایمیل</TableHead>

              <TableHead className="px-6 py-3 text-center font-semibold">نقش</TableHead>

              <TableHead className="px-6 py-3 text-center font-semibold ">عملیات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  کاربری با این مشخصات یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => {
                const userRole = user.role as UserRole;

                const isCurrentUser = user.id === currentUserId;

                const canManage = !isCurrentUser && canManageUser(currentUserRole, userRole);

                return (
                  <TableRow key={user.id}>
                    {/* Name + Avatar */}
                    <TableCell className="px-6 py-3 ">
                      <div className="flex items-center justify-start gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={user.image ?? ''} alt={user.name} />
                          <AvatarFallback className="bg-gray-100 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                            {user.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="px-6 py-3">{user.email}</TableCell>

                    {/* Role */}
                    <TableCell className="px-6 py-3 text-center">
                      <UserRoleSelect userId={user.id} role={userRole} disabled={!canManage} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* حذف */}
                        {canManage ? (
                          <DeleteUserModal userId={user.id} />
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled
                            title={
                              isCurrentUser
                                ? 'نمی‌توانید حساب خودتان را حذف کنید'
                                : 'شما اجازه حذف این کاربر را ندارید'
                            }
                          >
                            حذف
                          </Button>
                        )}

                        {/* بن / آن‌بن */}
                        {canManage ? (
                          <>
                            {!user.banned && <BanUserModal userId={user.id} />}

                            {user.banned && <UnbanUserModal userId={user.id} />}
                          </>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled
                            title={
                              isCurrentUser
                                ? 'نمی‌توانید حساب خودتان را بن کنید'
                                : 'شما اجازه مدیریت وضعیت این کاربر را ندارید'
                            }
                          >
                            بن
                          </Button>
                        )}

                        {/* ویرایش */}
                        {canManage ? (
                          <UpdateUserModal user={user} />
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled
                            title={
                              isCurrentUser
                                ? 'نمی‌توانید حساب خودتان را ویرایش کنید'
                                : 'شما اجازه ویرایش این کاربر را ندارید'
                            }
                          >
                            ویرایش
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
