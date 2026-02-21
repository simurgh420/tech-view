// components/product/form/fields/GalleryField.tsx
'use client';

import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Control } from 'react-hook-form';

import { ImageUploader } from '@/components/sections/image/ImageUploader';
import { ProductFormValues } from '../product.schema';

type Props = { control: Control<ProductFormValues> };

export function GalleryField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="images"
      render={({ field }) => {
        const images = field.value ?? [];

        return (
          <FormItem>
            <FormLabel>گالری تصاویر</FormLabel>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="space-y-2">
                    <ImageUploader
                      initialUrl={typeof img === 'string' ? img : null}
                      onChange={file => {
                        if (!file) return;
                        const updated = [...images];
                        updated[index] = file;
                        field.onChange(updated);
                      }}
                    />

                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full"
                      onClick={() => field.onChange(images.filter((_, i) => i !== index))}
                    >
                      حذف تصویر
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={() => field.onChange([...images, ''])}
              >
                افزودن تصویر جدید
              </Button>
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
