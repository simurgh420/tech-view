// @react-disable-file
'use client';
/* eslint-disable react-hooks/incompatible-library */
import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

type ColumnMeta = {
  minWidth?: number | string;
  maxWidth?: number | string;
  cellClass?: string;
};

interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  initialPageSize?: number;
  searchKey?: string;
  className?: string;
  isLoading?: boolean;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  initialPageSize = 10,
  searchKey,
  className,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    initialState: { pagination: { pageSize: initialPageSize } },
  });

  return (
    <div className={`w-full ${className ?? ''}`} dir="rtl">
      {/* Toolbar */}
      <div className="flex items-center gap-4 py-4">
        {searchKey && (
          <Input
            placeholder={`جستجو در ${searchKey}...`}
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        )}

        <div className="ml-auto flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                ستون‌ها
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter(c => c.getCanHide())
                .map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={val => col.toggleVisibility(!!val)}
                    className="capitalize"
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} ردیف
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  // ایمن‌سازی meta برای header
                  const headerMeta = (
                    header.column.columnDef as unknown as {
                      meta?: ColumnMeta;
                    }
                  ).meta;
                  const minWidthStyle =
                    headerMeta?.minWidth !== undefined
                      ? {
                          minWidth:
                            typeof headerMeta.minWidth === 'number'
                              ? `${headerMeta.minWidth}px`
                              : headerMeta.minWidth,
                        }
                      : undefined;

                  return (
                    <TableHead
                      key={header.id}
                      className="text-right whitespace-nowrap text-sm font-medium"
                      style={minWidthStyle}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              // ساده‌ترین skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="animate-pulse">
                  {columns.map((_, ci) => (
                    <TableCell key={ci} className="h-6 py-3">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map(cell => {
                    // ایمن‌سازی meta برای cell
                    const meta = (cell.column.columnDef as unknown as { meta?: ColumnMeta }).meta;
                    const maxWidthStyle = meta?.maxWidth
                      ? {
                          maxWidth:
                            typeof meta.maxWidth === 'number'
                              ? `${meta.maxWidth}px`
                              : meta.maxWidth,
                        }
                      : undefined;
                    const cellClass = meta?.cellClass ?? '';

                    return (
                      <TableCell
                        key={cell.id}
                        className={`align-top text-sm ${cellClass}`}
                        style={maxWidthStyle}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-gray-500"
                >
                  هیچ نتیجه‌ای یافت نشد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} از{' '}
          {table.getFilteredRowModel().rows.length} انتخاب شده
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            قبلی
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            بعدی
          </Button>
        </div>
      </div>
    </div>
  );
}
