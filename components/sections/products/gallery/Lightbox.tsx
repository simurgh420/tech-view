'use client';

import Image from 'next/image';
import { useEffect } from 'react';

type LightboxProps = {
  images: string[];
  index: number;
  onClose: () => void;
  onChange: (newIndex: number) => void;
};

export default function Lightbox({ images, index, onClose, onChange }: LightboxProps) {
  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // محافظت از index اشتباه
  const safeIndex = Math.min(Math.max(index, 0), images.length - 1);
  const currentImage = images[safeIndex];

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4"
      onClick={onClose} // کلیک روی پس‌زمینه → بستن
    >
      {/* Wrapper برای جلوگیری از بسته شدن هنگام کلیک روی عکس */}
      <div className="relative flex flex-col items-center gap-6" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-0 right-0 text-white text-3xl"
        >
          ✕
        </button>

        {/* Main image */}
        <div className="relative max-w-[90vw] max-h-[70vh] w-full h-full">
          <Image
            src={currentImage}
            alt={`lightbox-image-${safeIndex}`}
            width={1000}
            height={1000}
            className="object-contain transition-all duration-300"
            sizes="100vw"
            priority
          />
        </div>

        {/* Thumbnail gallery */}
        <div className="w-full overflow-hidden">
          <div className="flex justify-center gap-3 overflow-x-auto w-full py-2 scrollbar-hide">
            <div className="flex gap-3 w-max">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange(i)}
                  className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border ${
                    i === safeIndex ? 'border-blue-500' : 'border-gray-400'
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={img}
                      alt={`thumb-${i}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prev */}
        {safeIndex > 0 && (
          <button
            type="button"
            onClick={() => onChange(safeIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl"
          >
            ‹
          </button>
        )}

        {/* Next */}
        {safeIndex < images.length - 1 && (
          <button
            type="button"
            onClick={() => onChange(safeIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
