'use client';

import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Control } from 'react-hook-form';
import { ProductFormValues } from '../product.schema';

type Props = { control: Control<ProductFormValues> };

export function ColorsField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="colors"
      render={({ field }) => {
        const colors = field.value ?? [];

        return (
          <FormItem>
            <FormLabel>رنگ‌ها</FormLabel>

            <div className="space-y-3">
              {colors.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    className="text-right"
                    placeholder="نام رنگ (مثلاً: مشکی)"
                    value={color.name}
                    onChange={e => {
                      const updated = [...colors];
                      updated[index] = { ...updated[index], name: e.target.value };
                      field.onChange(updated);
                    }}
                  />

                  <Input
                    type="color"
                    className="w-12 h-10 p-1"
                    value={color.hex}
                    onChange={e => {
                      const updated = [...colors];
                      updated[index] = { ...updated[index], hex: e.target.value };
                      field.onChange(updated);
                    }}
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => field.onChange(colors.filter((_, i) => i !== index))}
                  >
                    حذف
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                onClick={() => field.onChange([...colors, { name: '', hex: '#000000' }])}
              >
                افزودن رنگ جدید
              </Button>
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
