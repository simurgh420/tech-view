'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { CartButton } from '@/components/layout/header/CartButton';
import { Button } from '@/components/ui/button';
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
import { SearchModal } from '@/components/sections/search/SearchModal';
import { ModeToggle } from '@/components/ui/theme-toggle';
import { HeaderIconButton } from './Headericonbutton';
import { cn } from '@/lib/utils';

interface UserActionsProps {
  session: Awaited<ReturnType<typeof import('@/lib/auth').auth.api.getSession>> | null;
}

export function UserActions({ session }: UserActionsProps) {
  const user = session?.user;
  const isAdmin = user?.role === 'ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdminOrSuper = isAdmin || isSuperAdmin;

  const [openSearch, setOpenSearch] = useState(false);

  return (
    <>
      {/* Search Modal */}
      <SearchModal open={openSearch} onClose={() => setOpenSearch(false)} />

      <div className="flex items-center gap-4">
        <ModeToggle />

        {/* Search Button */}
        <HeaderIconButton aria-label="جستجو" onClick={() => setOpenSearch(true)}>
          <Search className="size-5 text-gray-700 dark:text-gray-200" />
        </HeaderIconButton>
        {/* Cart */}
        <CartButton />

        {/* Not logged in */}
        {!user && (
          <Link href="/auth/login">
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full px-5 py-2 text-sm font-medium shadow-sm transition-all hover:text-red-600 hover:shadow dark:hover:text-red-400"
            >
              ورود / ثبت‌نام
            </Button>
          </Link>
        )}

        {/* Logged in */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex cursor-pointer items-center gap-3">
                <Avatar
                  className={cn(
                    'size-9 transition-all duration-200',
                    isSuperAdmin
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background group-hover:ring-primary/80'
                      : isAdmin
                        ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-background group-hover:ring-emerald-400'
                        : 'ring-1 ring-gray-200 group-hover:ring-gray-300 dark:ring-gray-700 dark:group-hover:ring-gray-600'
                  )}
                >
                  <AvatarImage src={user.image ?? ''} alt={user.name} />
                  <AvatarFallback
                    className={cn(
                      'font-medium',
                      isSuperAdmin
                        ? 'bg-primary/10 text-primary'
                        : isAdmin
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200'
                    )}
                  >
                    {user.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-white">
                  {user.name}
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl border border-gray-100 shadow-lg dark:border-gray-800"
            >
              <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400">
                حساب کاربری
              </DropdownMenuLabel>

              {/* نمایش لینک داشبورد برای ادمین و سوپرادمین */}
              {isAdminOrSuper && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard">داشبورد</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/wishlist">علاقه‌مندی‌ها</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile"> پروفایل</Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/profile/password">تغییر رمز عبور</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <LogoutButton className="w-full text-start text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </>
  );
}
