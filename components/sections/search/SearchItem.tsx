'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, FileText, FolderTree, Package } from 'lucide-react';

import { getSearchItemUrl } from '@/lib/getSearchItemUrl';
import { formatPrice } from '@/lib/formatPrice';
import { NormalizedSearchResult } from '@/types/search';

interface SearchItemProps {
  item: NormalizedSearchResult;
}

export function SearchItem({ item }: SearchItemProps) {
  const url = getSearchItemUrl(item);

  const icon =
    item.type === 'product' ? (
      <Package className="h-5 w-5 text-red-500" />
    ) : item.type === 'category' ? (
      <FolderTree className="h-5 w-5 text-blue-500" />
    ) : (
      <FileText className="h-5 w-5 text-emerald-500" />
    );

  return (
    <Link href={url}>
      <article
        className="
          group
          flex
          items-center
          gap-4

          rounded-2xl

          p-3

          transition-all
          duration-200

          hover:bg-accent
          hover:shadow-sm
        "
      >
        {/* Image */}

        <div
          className="
            flex
            h-16
            w-16
            shrink-0
            items-center
            justify-center

            overflow-hidden
            rounded-xl

            bg-muted
          "
        >
          {item.type === 'category' ? (
            item.icon ? (
              <Image
                src={item.icon}
                alt={item.title}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              icon
            )
          ) : item.image ? (
            <Image
              src={item.image}
              alt={item.title}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            icon
          )}
        </div>

        {/* Content */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon}

            <span className="text-xs text-muted-foreground">
              {item.type === 'product' ? 'محصول' : item.type === 'blog' ? 'مقاله' : 'دسته‌بندی'}
            </span>
          </div>

          <h3 className="mt-1 line-clamp-1 text-sm font-bold">{item.title}</h3>

          {/* Product */}

          {item.type === 'product' && (
            <>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}

              {item.price && (
                <p className="mt-2 text-sm font-bold text-red-600 dark:text-red-400">
                  {formatPrice(item.price)} تومان
                </p>
              )}
            </>
          )}

          {/* Blog */}

          {item.type === 'blog' && (
            <>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}

              {item.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="
                        rounded-full
                        bg-muted

                        px-2
                        py-1

                        text-[10px]
                      "
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Category */}

          {item.type === 'category' && item.parent && (
            <p className="mt-2 text-xs text-muted-foreground">زیر مجموعه {item.parent}</p>
          )}
        </div>

        <ChevronLeft
          className="
            h-5
            w-5

            text-muted-foreground

            opacity-0

            transition-all

            group-hover:translate-x-1
            group-hover:opacity-100
          "
        />
      </article>
    </Link>
  );
}
