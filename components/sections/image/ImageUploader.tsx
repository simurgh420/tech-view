// components/sections/image/ImageUploader.tsx
'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type GalleryItem = { id: number; url: string; file?: File };

type ImageUploaderProps = {
  initialUrl?: string | null;
  initialUrls?: string[];
  multiple?: boolean;
  /**
   * File      → فایل جدید انتخاب شد
   * undefined → تغییری نیست (یا فایل جدید برداشته شد و عکس موجود سر جایش است)
   * null      → عکس موجود (initialUrl) حذف شد
   */
  onChange: (file: File | undefined | null) => void;
  /** همه فایل‌های جدید فعلی، بعد از هر افزودن یا حذف (undefined اگر هیچ فایل جدیدی نیست) */
  onMultipleChange?: (files: File[] | undefined) => void;
  /** آدرس عکس‌های موجودی که هنوز باقی‌اند، بعد از هر افزودن یا حذف */
  onExistingUrlsChange?: (urls: string[]) => void;
};

const isBlob = (url: string) => url.startsWith('blob:');

export function ImageUploader({
  initialUrl,
  initialUrls = [],
  multiple = false,
  onChange,
  onMultipleChange,
  onExistingUrlsChange,
}: ImageUploaderProps) {
  const inputId = useId();
  const nextId = useRef(0);

  // ── Single mode ──
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [removedUrl, setRemovedUrl] = useState<string | null>(null);
  const initialRemoved = !!initialUrl && initialUrl === removedUrl;
  const singlePreview = localPreview ?? (initialUrl && !initialRemoved ? initialUrl : null);

  // ── Multiple mode ──
  const makeServerItems = (urls: string[]): GalleryItem[] =>
    urls.map(url => ({ id: nextId.current++, url }));
  // eslint-disable-next-line react-hooks/refs
  const [items, setItems] = useState<GalleryItem[]>(() => makeServerItems(initialUrls));

  // اگر محتوای initialUrls بعد از mount عوض شد (مثلاً داده دیرتر رسید)، عکس‌های موجود را همگام کن
  const initialKey = initialUrls.join('\n');
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setItems(prev => [...makeServerItems(initialUrls), ...prev.filter(i => i.file)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey]);

  // ── آزادسازی blobها: فقط هنگام unmount (حذف و جایگزینی را خودمان صریح انجام می‌دهیم) ──
  const blobsRef = useRef<string[]>([]);
  useEffect(() => {
    blobsRef.current = [localPreview, ...items.map(i => i.url)].filter(
      (u): u is string => !!u && isBlob(u)
    );
  });
  useEffect(() => {
    return () => blobsRef.current.forEach(url => URL.revokeObjectURL(url));
  }, []);

  function emitMulti(list: GalleryItem[]) {
    const files = list.flatMap(i => (i.file ? [i.file] : []));
    onMultipleChange?.(files.length > 0 ? files : undefined);
    onExistingUrlsChange?.(list.filter(i => !i.file).map(i => i.url));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple) {
      const added: GalleryItem[] = Array.from(files).map(file => ({
        id: nextId.current++,
        url: URL.createObjectURL(file),
        file,
      }));
      const next = [...items, ...added];
      setItems(next);
      emitMulti(next);
    } else {
      const file = files[0];
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(URL.createObjectURL(file));
      onChange(file);
    }

    e.target.value = '';
  }

  function removeSingle() {
    if (localPreview) {
      // فایل جدید برداشته شد؛ عکس موجود (اگر حذف نشده بود) دوباره دیده می‌شود
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
      onChange(initialRemoved ? null : undefined);
    } else {
      // عکس موجود حذف شد
      setRemovedUrl(initialUrl ?? null);
      onChange(null);
    }
  }

  function removeMulti(id: number) {
    const target = items.find(i => i.id === id);
    if (!target) return;
    if (isBlob(target.url)) URL.revokeObjectURL(target.url);
    const next = items.filter(i => i.id !== id);
    setItems(next);
    emitMulti(next);
  }

  const labelFocus = 'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2';

  return multiple ? (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <div key={item.id} className="relative inline-block">
            <Image
              src={item.url}
              width={96}
              height={96}
              alt={`تصویر ${idx + 1}`}
              className="rounded-md border shadow-md object-cover"
              unoptimized
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              aria-label={`حذف تصویر ${idx + 1}`}
              onClick={() => removeMulti(item.id)}
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
          'w-44',
          labelFocus
        )}
      >
        <Upload className="h-4 w-4" />
        {items.length > 0 ? 'افزودن تصاویر' : 'انتخاب تصاویر'}
      </label>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFile}
        className="sr-only"
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
            alt="پیش‌نمایش تصویر"
            className="rounded-full border shadow-md object-cover"
            unoptimized
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            aria-label="حذف تصویر"
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
          'text-white',
          labelFocus
        )}
      >
        <Upload className="h-4 w-4" />
        {singlePreview ? 'تغییر تصویر' : 'آپلود تصویر'}
      </label>

      <input id={inputId} type="file" accept="image/*" onChange={handleFile} className="sr-only" />
    </div>
  );
}
