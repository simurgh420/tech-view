'use client';

import { useMemo, useState } from 'react';

import GalleryMainImage from './GalleryMainImage';
import GalleryThumbnails from './GalleryThumbnails';
import Lightbox from './Lightbox';

type Props = {
  images: string[];
  thumbnail?: string | null;
};

export default function ProductGallery({ images, thumbnail }: Props) {
  const cleanedImages = useMemo(
    () => images.filter((img): img is string => typeof img === 'string' && img.trim() !== ''),
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

  // جلوگیری از خارج شدن index از محدوده
  const safeIndex =
    normalizedImages.length > 0 ? Math.min(activeIndex, normalizedImages.length - 1) : 0;

  if (!normalizedImages.length) {
    return (
      <div
        className="
          aspect-square
          rounded-xl
          bg-muted
          flex
          items-center
          justify-center
          text-sm
          text-muted-foreground
        "
      >
        تصویری موجود نیست
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-12
          gap-4
        "
      >
        {/* Thumbnails */}
        <div
          className="
            order-2
            md:order-1
            md:col-span-3
          "
        >
          <GalleryThumbnails
            images={normalizedImages}
            activeIndex={safeIndex}
            onSelect={setActiveIndex}
          />
        </div>

        {/* Main Image */}
        <div
          className="
            order-1
            md:order-2
            md:col-span-9
          "
        >
          <GalleryMainImage
            src={normalizedImages[safeIndex]}
            onClick={() => setLightboxOpen(true)}
          />
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={normalizedImages}
          index={safeIndex}
          onClose={() => setLightboxOpen(false)}
          onChange={setActiveIndex}
        />
      )}
    </div>
  );
}
