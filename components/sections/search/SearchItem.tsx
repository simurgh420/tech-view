import Image from 'next/image';
import { NormalizedSearchResult } from '@/types/search';
import Link from 'next/link';
import { getSearchItemUrl } from '@/lib/getSearchItemUrl';

interface SearchItemProps {
  item: NormalizedSearchResult;
}

export function SearchItem({ item }: SearchItemProps) {
  const url = getSearchItemUrl(item);
  return (
    <Link href={url}>
      <div className="border p-4 rounded-md hover:bg-muted/50 transition">
        <p className="text-xs text-muted-foreground mb-1">{item.type}</p>

        <h3 className="font-bold">{item.title}</h3>

        {/* BLOG */}
        {item.type === 'blog' && (
          <>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            )}

            {item.image && (
              <Image
                src={item.image}
                alt={item.title}
                width={80}
                height={80}
                className="object-cover rounded-md mt-3"
              />
            )}

            {item.tags.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {item.tags.map(tag => (
                  <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {/* PRODUCT */}
        {item.type === 'product' && (
          <>
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>

            {item.price && <p className="text-green-600 font-semibold mt-2">{item.price} تومان</p>}

            {item.image && (
              <Image
                src={item.image}
                alt={item.title}
                width={80}
                height={80}
                className="object-cover rounded-md mt-3"
              />
            )}
          </>
        )}

        {/* CATEGORY */}
        {item.type === 'category' && (
          <>
            {item.icon && (
              <Image
                src={item.icon}
                alt={item.title}
                width={40}
                height={40}
                className="object-cover rounded-md mt-3"
              />
            )}

            {item.parent && (
              <p className="text-xs text-muted-foreground mt-2">زیرمجموعه: {item.parent}</p>
            )}
          </>
        )}
      </div>
    </Link>
  );
}
