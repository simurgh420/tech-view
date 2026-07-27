'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { MegaMenu } from './MegaMenu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

const links = [
  { href: '/', label: 'خانه' },
  // محصولات در MegaMenu هندل می‌شود
  { href: '/blog', label: 'بلاگ' },
  { href: '/faq', label: 'سوالات' },
  { href: '/contact', label: 'تماس با ما' },
];

export function NavLinks() {
  const pathname = usePathname();

  // استایل فوق‌مدرن کپسولی (Pill-shaped)
  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    const isParentActive = href !== '/' && pathname.startsWith(href);

    return clsx(
      'group inline-flex h-10 w-max items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all outline-none',
      isActive || isParentActive
        ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
        : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-gray-50 dark:focus:bg-zinc-800 dark:focus:text-gray-50'
    );
  };

  return (
    <NavigationMenu dir="rtl" className="hidden md:flex z-50">
      <NavigationMenuList className="gap-2">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/" className={getLinkClasses('/')}>
              خانه
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* مگامنو محصولات */}
        <MegaMenu />

        {/* مابقی لینک‌ها */}
        {links
          .filter(l => l.href !== '/')
          .map(link => (
            <NavigationMenuItem key={link.href}>
              <NavigationMenuLink asChild>
                <Link href={link.href} className={getLinkClasses(link.href)}>
                  {link.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
