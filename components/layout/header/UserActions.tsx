'use client';

import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogoutButton } from '@/components/button/LogoutButton';
import { CartButton } from '@/components/cart/CartButton';

interface UserActionsProps {
  session: Awaited<ReturnType<typeof import('@/lib/auth').auth.api.getSession>> | null;
}

export function UserActions({ session }: UserActionsProps) {
  const user = session?.user;

  return (
    <div className="flex items-center gap-5">
      {/* Search */}
      <button
        type="button"
        aria-label="جستجو"
        className="
    relative flex items-center justify-center
    w-11 h-11 rounded-full
    bg-white/70 dark:bg-gray-800/60
    backdrop-blur-md
    shadow-sm hover:shadow-md
    border border-gray-200/50 dark:border-gray-700/50
    transition-all duration-200
    hover:scale-105 active:scale-95
  "
      >
        <Search className="size-5 text-gray-700 dark:text-gray-200" />
      </button>

      {/* Cart */}
      <CartButton />

      {/* Not logged in */}
      {!user && (
        <Link href="/login">
          <Button
            size="sm"
            variant={'ghost'}
            className="rounded-full px-5 py-2 text-sm font-medium shadow-sm hover:shadow transition-all"
          >
            ورود / ثبت‌نام
          </Button>
        </Link>
      )}

      {/* Logged in */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 cursor-pointer group">
              <Avatar className="size-9 ring-1 ring-gray-200 group-hover:ring-gray-300 transition-all">
                <AvatarImage src={user.image ?? ''} alt={user.name} />
                <AvatarFallback className="bg-gray-100 text-gray-600">
                  {user.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex items-center gap-2">
                {/* دایره نقش کاربر */}
                <span
                  className={`inline-block size-2 rounded-full ${
                    user.role === 'ADMIN' ? 'bg-green-500' : 'bg-orange-700'
                  }`}
                />
                {/* نام کاربر */}
                <span className="text-sm font-medium group-hover:text-gray-900 transition-colors">
                  {user.name}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl shadow-lg border border-gray-100"
          >
            <DropdownMenuLabel className="text-xs text-gray-500">حساب کاربری</DropdownMenuLabel>
            {user.role === 'ADMIN' && (
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard">داشبورد</Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem asChild>
              <Link href="/profile">ویرایش پروفایل</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/profile/password">تغییر رمز عبور</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <LogoutButton className="w-full text-left text-red-600 cursor-pointer hover:bg-red-50" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
