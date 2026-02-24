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
        const images = Array.isArray(field.value) ? field.value : [];

        return (
          <FormItem>
            <FormLabel>گالری تصاویر</FormLabel>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="space-y-2">
                    <ImageUploader
                      initialUrl={typeof img === 'string' ? img : null}
                      onChange={(file: File | undefined) => {
                        const updated = [...images];
                        updated[index] = file ?? null;
                        field.onChange(updated);
                      }}
                    />

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => field.onChange([...images, undefined])}
                    >
                      افزودن تصویر جدید
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => field.onChange([...images, null])}
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
