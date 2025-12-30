'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart, Search, User } from 'lucide-react';
import { useSession } from '@/hooks/auth/useSession';
import Link from 'next/link';
import { withAuthUser } from '@/lib/auth-user';
import { useLogout } from '@/hooks/auth/useLogout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserActions() {
  const { data, isLoading } = useSession();
  const auth = withAuthUser(data);
  const user = auth?.user;
  const logoutMutation = useLogout();

  return (
    <div className="flex items-center gap-4">
      <Search className="size-5 cursor-pointer" />
      <ShoppingCart className="size-5 cursor-pointer" />

      {/* Loading state */}
      {isLoading && <div className="w-20 h-6 bg-gray-200 animate-pulse rounded-md" />}

      {/* Not logged in */}
      {!isLoading && !user && (
        <Link href="/login">
          <Button size="sm">ورود / ثبت‌نام</Button>
        </Link>
      )}

      {/* Logged in */}
      {!isLoading && user && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer">
            <User className="size-6 text-muted-foreground" />
            <span className="text-sm font-medium">{user.name}</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>حساب کاربری</DropdownMenuLabel>

            <DropdownMenuItem asChild>
              <Link href="/dashboard">داشبورد</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/profile">پروفایل</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => logoutMutation.mutate()}
              className="text-red-600 cursor-pointer"
            >
              خروج از حساب
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
