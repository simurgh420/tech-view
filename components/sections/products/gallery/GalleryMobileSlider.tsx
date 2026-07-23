'use client';

import Image from 'next/image';

type GalleryMobileSliderProps = {
  images: string[];
  activeIndex: number;
  onChange: (index: number) => void;
};

export default function GalleryMobileSlider({
  images,
  activeIndex,
  onChange,
}: GalleryMobileSliderProps) {
  return (
    <div className="md:hidden">
      <div
        className="
          flex
          snap-x
          snap-mandatory
          gap-4
          overflow-x-auto
          px-1
          pb-2
          no-scrollbar
        "
      >
        {images.map((img, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index)}
            className="
              relative
              aspect-square
              w-full
              shrink-0
              snap-center
              overflow-hidden
              rounded-2xl
              border
              border-neutral-200
              bg-white
              p-4
              transition-all
              duration-300

              dark:border-neutral-800
              dark:bg-neutral-900
            "
          >
            <Image
              src={img}
              alt={`product-image-${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </button>
        ))}
      </div>

      {/* Dots */}
      <div className="mt-4 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => onChange(index)}
            className={`
              h-2 rounded-full transition-all duration-300
              ${activeIndex === index ? 'w-6 bg-red-500' : 'w-2 bg-neutral-300 dark:bg-neutral-700'}
            `}
          />
        ))}
      </div>
    </div>
  );
}
