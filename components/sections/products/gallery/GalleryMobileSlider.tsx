'use client';

import Image from 'next/image';

type GalleryMobileSliderProps = {
  images: string[];
  activeIndex: number;
  onChange: (index: number) => void;
};

export default function GalleryMobileSlider({ images, onChange }: GalleryMobileSliderProps) {
  return (
    <div className="snap-x snap-mandatory overflow-x-auto flex gap-4 md:hidden">
      {images.map((img, i) => (
        <div
          key={i}
          className="snap-center w-full shrink-0 cursor-pointer"
          onClick={() => onChange(i)}
        >
          <Image
            src={img}
            alt={`mobile-slide-${i}`}
            className="w-full aspect-square object-contain"
          />
        </div>
      ))}
    </div>
  );
}
