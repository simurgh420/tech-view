'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useMegaMenuStore } from '@/stores/useMegaMenuStore';

const links = [
  { href: '/', label: 'خانه' },
  { href: '/products', label: 'محصولات' },
  { href: '/blog', label: 'بلاگ' },
  { href: '/faq', label: 'سوالات' },
  { href: '/contact', label: 'تماس با ما' },
];

export function NavLinks() {
  const pathname = usePathname();
  const { open } = useMegaMenuStore();
  return (
    <nav className="hidden md:flex gap-6 text-sm font-medium">
      {links.map(link => {
        const isActive = pathname === link.href;
        // فقط برای لینک‌های غیر "/" حالت selected رو فعال کن
        const isParentActive = link.href !== '/' && pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onMouseEnter={link.href === '/products' ? open : undefined}
            className={clsx(
              'px-2 transition-all',
              isActive && 'text-black font-extrabold',
              isParentActive && 'text-blue-400 border-b-2 border-blue-400 pb-2',
              !isActive &&
                !isParentActive &&
                'text-muted-foreground hover:text-blue-600 hover:border-b hover:border-blue-600'
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
