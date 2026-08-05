'use client';

import { useMemo, useState } from 'react';

import GalleryMainImage from './GalleryMainImage';
import GalleryThumbnails from './GalleryThumbnails';
import GalleryMobileSlider from './GalleryMobileSlider';
import Lightbox from './Lightbox';
import { WishlistButton } from '../../wishlist/WishlistButton';

type Props = {
  images: string[];
  thumbnail?: string | null;
  productId: string;
};

export default function ProductGallery({ images, thumbnail, productId }: Props) {
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
      <div className="block md:hidden relative">
        <GalleryMobileSlider
          images={normalizedImages}
          activeIndex={safeIndex}
          onChange={setActiveIndex}
        />
        {/* دکمه ویش‌لیست روی موبایل – بالای اسلایدر سمت چپ */}
        <div className="absolute top-2 right-2 z-20">
          <WishlistButton
            productId={productId}
            className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm dark:bg-neutral-900/80 dark:hover:bg-neutral-900"
          />
        </div>
      </div>

      {/* نمای دسکتاپ (تامنیل‌ها + تصویر اصلی) */}
      <div className="hidden md:grid md:grid-cols-12 gap-4">
        <div className="md:col-span-3">
          <GalleryThumbnails
            images={normalizedImages}
            activeIndex={safeIndex}
            onSelect={setActiveIndex}
          />
        </div>

        <div className="md:col-span-9 relative">
          {/* دکمه ویش‌لیست روی تصویر اصلی دسکتاپ */}
          <div className="absolute top-2 right-2 z-20">
            <WishlistButton
              productId={productId}
              className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm dark:bg-neutral-900/80 dark:hover:bg-neutral-900"
            />
          </div>

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
