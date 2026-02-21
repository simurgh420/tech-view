// components/product/gallery/ProductGallery.tsx
'use client';

import { useState } from 'react';
import GalleryMainImage from './GalleryMainImage';
import GalleryThumbnails from './GalleryThumbnails';
import GalleryMobileSlider from './GalleryMobileSlider';

type Props = {
  images: string[];
};

export default function ProductGallery({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full space-y-4">
      {/* موبایل: اسلایدر */}
      <div className="block md:hidden">
        <GalleryMobileSlider images={images} activeIndex={activeIndex} onChange={setActiveIndex} />
      </div>

      {/* دسکتاپ: گالری کامل */}
      <div className="hidden md:grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <GalleryThumbnails
            images={images}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        </div>

        <div className="col-span-9">
          <GalleryMainImage src={images[activeIndex]} />
        </div>
      </div>
    </div>
  );
}
