/* eslint-disable @next/next/no-img-element */
'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

type ZoomLensProps = {
  src: string;
  alt?: string;
};

export default function ZoomLens({ src, alt = 'product image' }: ZoomLensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPos({ x, y });
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMove}
      className="relative w-full h-full overflow-hidden"
    >
      {/* لایهٔ اصلی با Next/Image */}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain transition-opacity duration-200"
        sizes="100vw"
      />

      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform duration-300 ${
          zoom ? 'scale-150 opacity-100' : 'scale-100 opacity-0'
        }`}
        style={{
          transformOrigin: `${pos.x}% ${pos.y}%`,
        }}
      />
    </div>
  );
}
