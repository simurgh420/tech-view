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

  const [pos, setPos] = useState({
    x: 50,
    y: 50,
  });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;

    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPos({
      x,
      y,
    });
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMove}
      className="
        relative
        w-full
        h-full
        overflow-hidden
        cursor-zoom-in
      "
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="
          (max-width:768px) 100vw,
          600px
        "
        className="
        object-contain
        select-none
        "
        style={{
          transformOrigin: `${pos.x}% ${pos.y}%`,
          transform: zoom ? 'scale(1.8)' : 'scale(1)',
          transition: zoom ? 'transform 0.05s ease-out' : 'transform 0.2s ease',
        }}
      />

      {zoom && (
        <div
          className="
            absolute
            pointer-events-none
            border
            border-white/50
            rounded-full
            w-20
            h-20
            bg-white/10
          "
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
}
