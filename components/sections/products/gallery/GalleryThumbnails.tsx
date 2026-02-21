// components/product/gallery/GalleryThumbnails.tsx

import { Button } from '@/components/ui';
import Image from 'next/image';

type Props = {
  images: string[];
  activeIndex: number;
  onSelect: (i: number) => void;
};

export default function GalleryThumbnails({ images, activeIndex, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {images.map((img, i) => (
        <Button
          key={i}
          onClick={() => onSelect(i)}
          className={`w-full border rounded-lg p-0 overflow-hidden ${
            activeIndex === i ? 'border-blue-500' : 'border-gray-300'
          }`}
        >
          <div className="relative w-full h-20">
            <Image
              src={img}
              alt={`thumbnail ${i + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        </Button>
      ))}
    </div>
  );
}
