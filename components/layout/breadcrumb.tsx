'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');

    return {
      label: decodeURIComponent(seg).replace(/-/g, ' '),
      href,
      isLast: index === segments.length - 1,
    };
  });

  return (
    <nav className="text-sm text-gray-500 flex items-center gap-2">
      <Link href="/" className="hover:text-gray-700">
        Home
      </Link>

      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-2">
          <span>{'>'}</span>

          {c.isLast ? (
            <span className="text-gray-900 font-medium capitalize">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-gray-700 capitalize">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
