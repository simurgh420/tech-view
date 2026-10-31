'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

import { Control } from 'react-hook-form';
import { ImageUploader } from '../../../../components/sections/image/ImageUploader';
import { BlogFormType } from '@/features/blog/schemas/blog';

export function BlogCoverSection({
  control,
  initialUrl,
}: {
  control: Control<BlogFormType>;
  initialUrl: string | null;
}) {
  return (
    <FormField
      control={control}
      name="coverImageUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>تصویر کاور</FormLabel>
          <FormControl>
            <ImageUploader initialUrl={initialUrl} onChange={file => field.onChange(file)} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
