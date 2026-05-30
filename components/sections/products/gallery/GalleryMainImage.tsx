'use client';

import ZoomLens from './ZoomLens';

export default function GalleryMainImage({ src, onClick }: { src: string; onClick?: () => void }) {
  return (
    <div
      className="relative w-full aspect-square overflow-hidden rounded-xl border  cursor-zoom-in"
      onClick={onClick}
    >
      <ZoomLens src={src} />
    </div>
  );
}
