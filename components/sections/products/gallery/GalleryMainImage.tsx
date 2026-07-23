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
        cursor-zoom-in
      "
      onClick={onClick}
    >
      <ZoomLens src={src} />
    </div>
  );
}
