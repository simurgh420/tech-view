'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { SocialIcons } from './SocialIcons';

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
    ],
  },
] as const;

export function FooterColumns() {
  const [email, setEmail] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: اتصال به API خبرنامه — فعلاً فقط جلوی رفرش صفحه گرفته می‌شه
    if (!email.trim()) return;
    console.log('newsletter signup:', email);
    setEmail('');
  }

  return (
    <div className="grid grid-cols-1 gap-8 text-sm sm:grid-cols-2 md:grid-cols-4">
      {COLUMNS.map(column => (
        <div key={column.title} className="px-4 sm:px-6">
          <h4 className="mb-3 font-semibold text-white">{column.title}</h4>
          <ul className="space-y-2">
            {column.links.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-neutral-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* ستون تماس با ما */}
      <div className="px-4 sm:px-6">
        <h4 className="mb-3 font-semibold text-white">تماس با ما</h4>
        <ul className="space-y-2 text-neutral-400">
          {/* TODO: آدرس واقعی رو جایگزین کن */}
          <li>تهران، خیابان مثال</li>
          <li dir="ltr" className="text-right">
            +98 936 876 6577
          </li>
          <li dir="ltr" className="text-right">
            mohamadrezah420@gmail.com
          </li>
        </ul>
      </div>

      {/* ستون عضویت در خبرنامه */}
      <div className="px-4 sm:px-6">
        <h4 className="mb-3 font-semibold text-white">عضویت در خبرنامه</h4>

        <form onSubmit={handleSubmit} className="relative mt-2">
          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-neutral-500">
            <Mail className="size-4" />
          </span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="آدرس ایمیل"
            required
            suppressHydrationWarning
            className="w-full rounded-md border border-white/10 bg-neutral-800/60 py-2.5 ps-10 pe-12
             text-sm text-white placeholder:text-neutral-500 shadow-sm transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="آدرس ایمیل"
          />
          <Button
            type="submit"
            aria-label="ثبت ایمیل"
            variant="link"
            className="absolute inset-y-0 end-1 top-0.5 flex items-center justify-center rounded-md bg-transparent px-2 text-primary transition-colors hover:opacity-70"
          >
            <ArrowLeft className="size-4" />
          </Button>
        </form>

        {/* آیکن‌های شبکه اجتماعی */}
        <div className="mt-4">
          <SocialIcons />
        </div>
      </div>
    </div>
  );
}
