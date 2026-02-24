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
    <div className="flex flex-col gap-3 overflow-y-auto max-h-500px pr-1">
      {images.map((img, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className={`w-full border rounded-lg overflow-hidden transition-colors ${
            activeIndex === i ? 'border-blue-500' : 'border-gray-300'
          }`}
        >
          <div className="relative w-full aspect-square">
            <Image src={img} alt={`thumbnail-${i}`} fill className="object-cover" sizes="100px" />
          </div>
        </button>
      ))}
    </div>
  );
}
