'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

type LightboxProps = {
  images: string[];
  index: number;
  onClose: () => void;
  onChange: (newIndex: number) => void;
};

export default function Lightbox({ images, index, onClose, onChange }: LightboxProps) {
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const safeIndex = Math.min(Math.max(index, 0), Math.max(images.length - 1, 0));
  const currentImage = images[safeIndex];

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && safeIndex > 0) onChange(safeIndex - 1);
      if (e.key === 'ArrowRight' && safeIndex < images.length - 1) onChange(safeIndex + 1);
    };

    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose, onChange, safeIndex, images.length]);

  useEffect(() => {
    thumbnailRefs.current[safeIndex]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [safeIndex]);

  if (!currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* دکمه بستن */}
      <button
        type="button"
        onClick={onClose}
        className="
          fixed
          top-5
          right-5
          z-50
          text-white
          hover:scale-110
          transition
        "
      >
        <X className="w-8 h-8" />
      </button>

      <div className="relative flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
        {/* تصویر اصلی */}
        <div
          className="
            relative
            w-[90vw]
            max-w-5xl
            h-[75vh]
            rounded-xl
            overflow-hidden
          "
        >
          <Image
            src={currentImage}
            alt={`image-${safeIndex}`}
            fill
            priority
            sizes="90vw"
            className="object-contain"
          />
        </div>

        {/* دکمه قبلی */}
        {safeIndex > 0 && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onChange(safeIndex - 1);
            }}
            className="
              fixed
              left-5
              top-1/2
              -translate-y-1/2
              text-white
              hover:scale-110
              transition
            "
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
        )}

        {/* دکمه بعدی */}
        {safeIndex < images.length - 1 && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onChange(safeIndex + 1);
            }}
            className="
              fixed
              right-5
              top-1/2
              -translate-y-1/2
              text-white
              hover:scale-110
              transition
            "
          >
            <ChevronRight className="w-12 h-12" />
          </button>
        )}

        {/* تامنیل‌ها */}
        <div className="max-w-[90vw] overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-2">
            {images.map((img, i) => (
              <button
                key={`${img}-${i}`}
                ref={el => {
                  thumbnailRefs.current[i] = el;
                }}
                type="button"
                onClick={() => onChange(i)}
                className={`
                  relative
                  w-20
                  h-20
                  shrink-0
                  overflow-hidden
                  rounded-lg
                  border-2
                  transition
                  ${i === safeIndex ? 'border-red-500 scale-105' : 'border-transparent opacity-70'}
                `}
              >
                <Image
                  src={img}
                  alt={`thumbnail-${i}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
