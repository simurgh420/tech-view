'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { ImageUploader } from '@/components/sections/image/ImageUploader';
import { ProductFormValues } from '../product.schema';

type Props = { control: Control<ProductFormValues> };

export function ThumbnailField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="thumbnail"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="thumbnail">تصویر شاخص</FormLabel>
          <FormControl>
            <ImageUploader
              initialUrl={typeof field.value === 'string' ? field.value : null}
              onChange={value => field.onChange(value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
