// components/image/ImageUploader.tsx
'use client';

import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ImageUploaderProps = {
  initialUrl?: string | null;
  onChange: (file: File | undefined) => void;
};

export function ImageUploader({ initialUrl, onChange }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // مدیریت امن object URL
  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onChange(file); // ✅ فایل پاس بده
      e.target.value = '';
    }
  }

  function removeImage() {
    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onChange(undefined); // ✅ مقدار فرم پاک می‌شه
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col items-start gap-4">
      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <Image
            src={preview}
            width={96}
            height={96}
            alt="Profile preview"
            className="rounded-full border shadow-md object-cover"
            unoptimized
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={removeImage}
            className="absolute -top-2 -right-2 rounded-full shadow-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Button */}
      <label
        htmlFor="file-upload"
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer shadow-sm transition text-sm font-medium',
          preview ? 'bg-orange-600  hover:bg-orange-700' : 'bg-green-600  hover:bg-green-700'
        )}
      >
        <Upload className="h-4 w-4" />

        {preview ? 'تغییر تصویر' : 'آپلود تصویر'}
      </label>
      <input
        id="file-upload"
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
