import Link from 'next/link';

const COLUMNS = [
  {
    title: 'درباره‌ی ما',
    links: [
      { label: 'درباره‌ی ما', href: '/about' },
      { label: 'بلاگ', href: '/blog' },
      { label: 'بازگشت کالا', href: '/returns' },
      { label: 'وضعیت سفارش', href: '/orders' },
    ],
  },
  {
    title: 'اطلاعات',
    links: [
      { label: 'روش خرید', href: '/how-it-works' },
      { label: 'تعهدات ما', href: '/promises' },
      { label: 'سوالات متداول', href: '/faq' },
      { label: 'تماس با ما', href: '/contact' },
    ],
  },
  {
    title: 'دسته‌بندی‌ها',
    links: [
      { label: 'موبایل', href: '/products?category=mobile' },
      { label: 'لپ‌تاپ', href: '/products?category=laptop' },
      { label: 'لوازم جانبی', href: '/products?category=accessories' },
      { label: 'همه‌ی محصولات', href: '/products' },
    ],
  },
] as const;

export function FooterColumns() {
  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
      {COLUMNS.map(column => (
        <div key={column.title}>
          <h4 className="mb-4 text-sm font-semibold text-foreground">{column.title}</h4>
          <ul className="space-y-3">
            {column.links.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
