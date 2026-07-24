'use client';

import { useMemo, useState } from 'react';

import GalleryMainImage from './GalleryMainImage';
import GalleryThumbnails from './GalleryThumbnails';
import GalleryMobileSlider from './GalleryMobileSlider';
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
      {/* نمای موبایل (اسلایدر لمسی) */}
      <div className="block md:hidden">
        <GalleryMobileSlider
          images={normalizedImages}
          activeIndex={safeIndex}
          onChange={setActiveIndex}
        />
      </div>
      {/* نمای دسکتاپ (تامنیل‌ها + تصویر اصلی) */}
      <div
        className="
          hidden
          md:grid
          md:grid-cols-12
          gap-4
        "
      >
        <div className="md:col-span-3">
          <GalleryThumbnails
            images={normalizedImages}
            activeIndex={safeIndex}
            onSelect={setActiveIndex}
          />
        </div>

        <div className="md:col-span-9">
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
