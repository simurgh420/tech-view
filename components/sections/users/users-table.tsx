'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  DeleteUserButton,
  PlaceholderDeleteUserButton,
} from '@/components/sections/button/delete-user-button';

import { UserRoleSelect } from '@/components/sections/button/user-role-select';
import type { UserRole } from '@/types/user';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UsersTable({ users }: { users: any[] }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-2">ID</TableHead>
            <TableHead className="px-4 py-2">Name</TableHead>
            <TableHead className="px-4 py-2">Email</TableHead>
            <TableHead className="px-4 py-2 text-center">Role</TableHead>
            <TableHead className="px-4 py-2 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell className="px-4 py-2">{user.id.slice(0, 8)}</TableCell>
              <TableCell className="px-4 py-2">{user.name}</TableCell>
              <TableCell className="px-4 py-2">{user.email}</TableCell>

              <TableCell className="px-4 py-2 text-center">
                <UserRoleSelect userId={user.id} role={user.role as UserRole} />
              </TableCell>

              <TableCell className="px-4 py-2 text-center">
                {user.role === 'USER' ? (
                  <DeleteUserButton userId={user.id} />
                ) : (
                  <PlaceholderDeleteUserButton />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
