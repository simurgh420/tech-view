'use client';

import Image from 'next/image';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Control } from 'react-hook-form';
import { ImageUploader } from '@/components/sections/image/ImageUploader';
import { ProductFormType } from '@/lib/validation/product';
import { Trash2 } from 'lucide-react';

type Props = { control: Control<ProductFormType> };

export function GalleryField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="images"
      render={({ field }) => {
        const images: (string | File)[] = Array.isArray(field.value) ? field.value : [];

        const removeImage = (index: number) => {
          const updated = images.filter((_, i) => i !== index);
          field.onChange(updated);
        };

        const handleMultipleFiles = (files: File[] | undefined) => {
          if (!files || files.length === 0) return;
          const existingUrls = images.filter((v): v is string => typeof v === 'string');
          field.onChange([...existingUrls, ...files]);
        };

        return (
          <FormItem>
            <FormLabel>گالری تصاویر</FormLabel>

            <div className="space-y-4">
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      {typeof img === 'string' ? (
                        <div className="relative h-24 w-full rounded-lg border overflow-hidden">
                          <Image
                            src={img}
                            alt={`gallery-${index}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 33vw"
                            unoptimized // اگر دامنه تصاویر در next.config.js تنظیم نشده
                          />
                        </div>
                      ) : (
                        <div className="h-24 w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                          {img.name}
                        </div>
                      )}

                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <ImageUploader
                multiple
                initialUrls={[]}
                onChange={() => {}}
                onMultipleChange={handleMultipleFiles}
              />
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
