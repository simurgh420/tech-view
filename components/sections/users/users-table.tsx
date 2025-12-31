'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { useUsers } from '@/hooks/useUsers';

export function UsersTable() {
  const { useGetUsers } = useUsers();
  const { data, isLoading } = useGetUsers();

  console.log('users:', data);
  console.log('isLoading', isLoading);

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4">
      <DataTable
        columns={columns}
        data={data ?? []}
        searchKey="نام یا ایمیل"
        initialPageSize={10}
      />
    </div>
  );
}
