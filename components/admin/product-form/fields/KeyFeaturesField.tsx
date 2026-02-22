'use client';

import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Control } from 'react-hook-form';
import { ProductFormValues } from '../product.schema';

type Props = { control: Control<ProductFormValues> };

export function KeyFeaturesField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="keyFeatures"
      render={({ field }) => {
        const features = Array.isArray(field.value) ? field.value : [];

        return (
          <FormItem>
            <FormLabel>ویژگی‌های کلیدی</FormLabel>

            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    id={`keyFeature-${index}`}
                    value={feature}
                    placeholder="مثلاً: صفحه‌نمایش 120Hz"
                    onChange={e => {
                      const updated = [...features];
                      updated[index] = e.target.value;
                      field.onChange(updated);
                    }}
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => field.onChange(features.filter((_, i) => i !== index))}
                  >
                    حذف
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (features.length > 0 && !features[features.length - 1]) return;
                  field.onChange([...features, '']);
                }}
              >
                افزودن ویژگی جدید
              </Button>
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
