'use client';

import Image from 'next/image';

type GalleryThumbnailsProps = {
  images: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export default function GalleryThumbnails({
  images,
  activeIndex,
  onSelect,
}: GalleryThumbnailsProps) {
  return (
    <div
      className="
        flex
        flex-col
        gap-3
        overflow-y-auto
        pr-1
        max-h-[560px]
        no-scrollbar
      "
    >
      {images.map((img, index) => {
        const active = activeIndex === index;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={`
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              bg-white
              p-2
              transition-all
              duration-200

              ${
                active
                  ? `
                    border-red-500
                    shadow-md
                    shadow-red-500/15
                  `
                  : `
                    border-neutral-200
                    hover:border-neutral-300
                    hover:shadow-sm

                    dark:border-neutral-700
                    dark:bg-neutral-900
                    dark:hover:border-neutral-600
                  `
              }
            `}
          >
            <div className="relative aspect-square w-20 overflow-hidden rounded-xl">
              <Image
                src={img}
                alt={`thumbnail-${index + 1}`}
                fill
                sizes="80px"
                className="
                  object-contain
                  transition-transform
                  duration-300
                  group-hover:scale-105
                "
              />
            </div>

            {active && (
              <span
                className="
                  absolute
                  inset-y-3
                  right-0
                  w-1
                  rounded-l-full
                  bg-red-500
                "
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
