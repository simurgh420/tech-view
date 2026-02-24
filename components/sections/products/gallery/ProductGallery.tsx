'use client';

import { useState, useMemo } from 'react';
import GalleryMainImage from './GalleryMainImage';
import GalleryThumbnails from './GalleryThumbnails';
import Lightbox from './Lightbox';

type Props = {
  images: string[];
  thumbnail?: string | null;
};

export default function ProductGallery({ images, thumbnail }: Props) {
  const cleanedImages = useMemo(
    () => images.filter(img => typeof img === 'string' && img.trim() !== ''),
    [images]
  );

  const normalizedImages = useMemo(() => {
    if (thumbnail && !cleanedImages.includes(thumbnail)) {
      return [thumbnail, ...cleanedImages];
    }
    return cleanedImages;
  }, [thumbnail, cleanedImages]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <GalleryThumbnails
            images={normalizedImages}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        </div>

        <div className="col-span-9">
          <GalleryMainImage
            src={normalizedImages[activeIndex]}
            onClick={() => setLightboxOpen(true)}
          />
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={normalizedImages}
          index={activeIndex}
          onClose={() => setLightboxOpen(false)}
          onChange={setActiveIndex}
        />
      )}
    </div>
  );
}
