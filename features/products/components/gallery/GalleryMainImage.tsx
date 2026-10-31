'use client';

import ZoomLens from './ZoomLens';

type Props = {
  src: string;
  onClick?: () => void;
};

export default function GalleryMainImage({ src, onClick }: Props) {
  return (
    <div
      className="
        relative
        w-full
        aspect-square
        overflow-hidden
        rounded-xl
        border
        border-neutral-200
        bg-white
        cursor-zoom-in
        dark:border-neutral-800
        dark:bg-neutral-900
      "
      onClick={onClick}
    >
      <ZoomLens src={src} />
    </div>
  );
}
