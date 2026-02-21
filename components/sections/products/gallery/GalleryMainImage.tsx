// components/product/gallery/GalleryMainImage.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function GalleryMainImage({ src }: { src: string }) {
  const [zoom, setZoom] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-xl border bg-white w-full h-400px"
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
    >
      <Image
        src={src}
        alt="product main image"
        fill
        className={`object-cover transition-transform duration-300 ${
          zoom ? 'scale-125' : 'scale-100'
        }`}
        sizes="100vw"
      />
    </div>
  );
}
