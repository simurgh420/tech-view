'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { navLinks, productLinks } from './navItems';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);

  const itemClass = (href: string) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return cn(
      'flex w-full items-center rounded-full px-4 py-3 text-base font-medium transition-colors',
      active
        ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800'
    );
  };

  const [home, ...rest] = navLinks;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="باز کردن منو">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        dir="rtl"
        aria-describedby={undefined}
        className="flex w-[85%] max-w-sm flex-col p-0"
      >
        <SheetHeader className="border-b px-4 py-4 text-right">
          <SheetTitle>منو</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          <Link href={home.href} onClick={close} className={itemClass(home.href)}>
            {home.label}
          </Link>

          <button
            type="button"
            onClick={() => setProductsOpen(v => !v)}
            aria-expanded={productsOpen}
            className={cn(itemClass('/products'), 'justify-between')}
          >
            محصولات
            <ChevronDown
              className={cn('size-4 transition-transform', productsOpen && 'rotate-180')}
            />
          </button>

          {productsOpen && (
            <div className="mr-4 flex flex-col gap-1 border-r pr-3">
              {productLinks.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {rest.map(item => (
            <Link key={item.href} href={item.href} onClick={close} className={itemClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* تغییر تم فقط توی منوی موبایل */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-sm text-muted-foreground">تغییر تم</span>
          <ModeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
