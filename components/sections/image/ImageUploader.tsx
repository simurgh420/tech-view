// components/image/ImageUploader.tsx
'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
type ImageUploaderProps = {
  initialUrl?: string | null;
  onChange: (file: File | undefined) => void;
};
export function ImageUploader({ initialUrl, onChange }: ImageUploaderProps) {
  const [preview, setPreview] = useState(initialUrl ?? null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange(file);
      e.target.value = '';
    }
  }
  function removeImage() {
    setPreview(null);
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }
  return (
    <div>
      {preview && (
        <div className="relative inline-block mb-2">
          <Image src={preview} width={80} height={80} alt="preview" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
          >
            ×
          </button>
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleFile} />
    </div>
  );
}
