'use client';

import Image from 'next/image';
import { useRef, useState, useEffect, useId } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ImageUploaderProps = {
  initialUrl?: string | null;
  onChange: (file: File | undefined) => void;
};

export function ImageUploader({ initialUrl, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  // فقط وقتی کاربر فایل انتخاب می‌کنه blob می‌سازیم
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // 👇 preview نهایی همیشه از این میاد
  const preview = localPreview ?? initialUrl ?? null;

  // cleanup فقط برای blob ها
  useEffect(() => {
    return () => {
      if (localPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    onChange(file);

    e.target.value = '';
  }

  function removeImage() {
    if (localPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview);
    }

    setLocalPreview(null);
    onChange(undefined);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col items-start gap-4">
      {preview && (
        <div className="relative inline-block">
          <Image
            src={preview}
            width={96}
            height={96}
            alt="Preview"
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

      <label
        htmlFor={inputId}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer shadow-sm transition text-sm font-medium',
          preview ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
        )}
      >
        <Upload className="h-4 w-4" />
        {preview ? 'تغییر تصویر' : 'آپلود تصویر'}
      </label>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
