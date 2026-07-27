'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { categories } from '@/data/categories';
import { clsx } from 'clsx';
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

export function MegaMenu() {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const isParentActive = pathname.startsWith('/products');

  return (
    <NavigationMenuItem>
      {/* Trigger */}
      <NavigationMenuTrigger
        className={clsx(
          'h-auto rounded-none bg-transparent px-2 py-2 text-sm font-medium transition-all hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent',
          isParentActive
            ? 'border-b-2 border-red-600 font-extrabold text-red-600 dark:border-red-400 dark:text-red-400'
            : 'border-b-2 border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-900 focus:text-gray-900 dark:hover:border-gray-600 dark:hover:text-gray-100 dark:focus:text-gray-100'
        )}
      >
        محصولات
      </NavigationMenuTrigger>

      {/* Content */}
      <NavigationMenuContent>
        <div className="grid w-[90vw] max-w-237.5 grid-cols-1 gap-4 p-4 md:w-187.5 md:grid-cols-4 lg:w-237.5 lg:gap-6">
          <div className="border-e border-gray-100 pe-3 md:col-span-1 dark:border-zinc-800">
            <h4 className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              دسته‌بندی‌ها
            </h4>
            <ul className="flex flex-col space-y-1">
              {categories.map(cat => (
                <li key={cat.name}>
                  <Link href={cat.link} legacyBehavior passHref>
                    <NavigationMenuLink
                      onMouseEnter={() => setActiveCategory(cat)}
                      onFocus={() => setActiveCategory(cat)}
                      className={clsx(
                        'flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium transition-all outline-none duration-200',
                        activeCategory.name === cat.name
                          ? 'bg-red-50 text-red-600 shadow-sm dark:bg-red-950/30 dark:text-red-400'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800/50 dark:hover:text-gray-100'
                      )}
                    >
                      <cat.icon
                        className={clsx(
                          'me-2.5 size-4 transition-transform duration-200',
                          activeCategory.name === cat.name && 'scale-110'
                        )}
                      />
                      {cat.name}
                    </NavigationMenuLink>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ستون محصولات */}
          <div className="md:col-span-3">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-zinc-800">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                محصولات {activeCategory.name}
              </h4>
              <span className="text-xs text-muted-foreground">
                {activeCategory.products.length} کالا
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {activeCategory.products.map(item => (
                <Link key={item.id} href={item.link} legacyBehavior passHref>
                  {/* کارت محصول: استایل متریال با افکت Lift */}
                  <NavigationMenuLink className="group flex flex-col items-center gap-3 rounded-xl border border-transparent bg-transparent p-2 transition-all duration-300 hover:-translate-y-1 hover:border-gray-100 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 focus:-translate-y-1 focus:bg-white focus:shadow-lg outline-none dark:hover:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:shadow-black/50 dark:focus:bg-zinc-900">
                    {/* قاب عکس: پس‌زمینه ملایم برای جلوه بهتر عکس‌های PNG */}
                    <div className="relative flex h-20 w-full items-center justify-center rounded-lg bg-gray-50/80 p-2 transition-colors group-hover:bg-transparent dark:bg-zinc-800/30 dark:group-hover:bg-transparent">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <p className="text-center text-xs font-semibold text-gray-700 transition-colors group-hover:text-red-600 dark:text-gray-300 dark:group-hover:text-red-400">
                      {item.title}
                    </p>
                  </NavigationMenuLink>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
