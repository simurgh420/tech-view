'use client';

import Image from 'next/image';
import { useRef, useState, useEffect, useId } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ImageUploaderProps = {
  initialUrl?: string | null;
  initialUrls?: string[];
  multiple?: boolean;
  onChange: (file: File | undefined) => void;
  onMultipleChange?: (files: File[] | undefined) => void;
};

export function ImageUploader({
  initialUrl,
  initialUrls = [],
  multiple = false,
  onChange,
  onMultipleChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  // Single mode preview
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const singlePreview = localPreview ?? initialUrl ?? null;
  // Multiple mode previews

  const [multiplePreviews, setMultiplePreviews] = useState<string[]>(initialUrls);

  // cleanup فقط برای blob ها
  useEffect(() => {
    return () => {
      // cleanup blobs in single mode
      if (localPreview?.startsWith('blob:')) URL.revokeObjectURL(localPreview);
      // cleanup blobs in multiple mode
      multiplePreviews.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [localPreview, multiplePreviews]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple) {
      const fileArray = Array.from(files);
      const newPreviews = fileArray.map(file => URL.createObjectURL(file));
      setMultiplePreviews(prev => [...prev, ...newPreviews]);
      onMultipleChange?.(fileArray);
    } else {
      const file = files[0];
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);
      onChange(file);
    }

    e.target.value = '';
  }

  function removeSingle() {
    if (localPreview?.startsWith('blob:')) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    onChange(undefined);
  }
  function removeMulti(index: number) {
    const url = multiplePreviews[index];
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    const updated = multiplePreviews.filter((_, i) => i !== index);
    setMultiplePreviews(updated);
  }
  return multiple ? (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {multiplePreviews.map((url, idx) => (
          <div key={idx} className="relative inline-block">
            <Image
              src={url}
              width={96}
              height={96}
              alt={`gallery-${idx}`}
              className="rounded-md border shadow-md object-cover"
              unoptimized
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeMulti(idx)}
              className="absolute -top-2 -right-2 rounded-full shadow-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <label
        htmlFor={inputId}
        className={cn(
          'flex items-center justify-center gap-2 px-4 py-2 rounded-lg cursor-pointer shadow-sm transition text-sm font-medium',
          'bg-blue-600 hover:bg-blue-700 text-white', 
          'w-44'
        )}
      >
        <Upload className="h-4 w-4" />
        {multiplePreviews.length > 0 ? 'افزودن تصاویر' : 'انتخاب تصاویر'}
      </label>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFile}
        className="hidden"
      />
    </div>
  ) : (
    <div className="flex flex-col items-start gap-4">
      {singlePreview && (
        <div className="relative inline-block">
          <Image
            src={singlePreview}
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
            onClick={removeSingle}
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
          singlePreview ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700',
          'text-white'
        )}
      >
        <Upload className="h-4 w-4" />
        {singlePreview ? 'تغییر تصویر' : 'آپلود تصویر'}
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
