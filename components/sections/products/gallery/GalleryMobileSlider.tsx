// components/product/gallery/GalleryMobileSlider.tsx

import Image from 'next/image';

type Props = {
  images: string[];
  activeIndex: number;
  onChange: (i: number) => void;
};

export default function GalleryMobileSlider({ images, activeIndex, onChange }: Props) {
  return (
    <div className="flex overflow-x-auto space-x-3 snap-x snap-mandatory">
      {images.map((img, i) => (
        <div
          key={i}
          className={`snap-center min-w-64 min-h-64 relative rounded-xl border cursor-pointer ${
            activeIndex === i ? 'border-blue-500' : 'border-gray-300'
          }`}
          onClick={() => onChange(i)}
        >
          <Image
            src={img}
            alt={`product image ${i + 1}`} 
            fill 
            className="object-cover rounded-xl"
            sizes="256px"
          />
        </div>
      ))}
    </div>
  );
}
