import Link from 'next/link';

type Props = {
  title: string;
  brand: string;
  brandSlug?: string;
};

export default function ProductTitle({ title, brand, brandSlug }: Props) {
  const brandUrl = brandSlug ? `products/brand/${brandSlug}` : `products/brand/${brand}`;

  return (
    <header className="space-y-4 text-start">
      <div className="space-y-2">
        {/* span تبدیل شد به Link */}
        <Link
          href={brandUrl}
          className="
            inline-flex
            rounded-full
            bg-neutral-100
            px-3
            py-1
            text-xs
            font-medium
            text-neutral-600
            transition-colors
            duration-200
            hover:bg-neutral-200
            hover:text-neutral-900

            dark:bg-neutral-800
            dark:text-neutral-300
            dark:hover:bg-neutral-700
            dark:hover:text-neutral-100
          "
        >
          {brand}
        </Link>

        <h1
          className="
            text-3xl
            font-extrabold
            leading-tight
            tracking-tight
            text-neutral-900
            text-right
            [direction:ltr]
            [unicode-bidi:plaintext]

            dark:text-neutral-100
          "
        >
          {title}
        </h1>
      </div>
    </header>
  );
}
