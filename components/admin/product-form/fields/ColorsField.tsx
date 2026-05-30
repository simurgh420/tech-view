'use client';

import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Control } from 'react-hook-form';
import { ProductFormType } from '@/lib/validation/product';

type Props = { control: Control<ProductFormType> };

export function ColorsField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="colors"
      render={({ field }) => {
        const colors = Array.isArray(field.value) ? field.value : [];

        return (
          <FormItem>
            <FormLabel>رنگ‌ها</FormLabel>

            <div className="space-y-3">
              {colors.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* نام رنگ */}
                  <Input
                    id={`color-name-${index}`}
                    placeholder="نام رنگ (مثلاً: مشکی مات)"
                    value={color.name}
                    onChange={e => {
                      const updated = [...colors];
                      updated[index] = { ...updated[index], name: e.target.value };
                      field.onChange(updated);
                    }}
                  />

                  {/* انتخاب رنگ */}
                  <Input
                    id={`color-hex-${index}`}
                    type="color"
                    className="w-12 h-10 p-1"
                    value={color.hex}
                    onChange={e => {
                      const updated = [...colors];
                      updated[index] = { ...updated[index], hex: e.target.value };
                      field.onChange(updated);
                    }}
                  />

                  {/* حذف */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => field.onChange(colors.filter((_, i) => i !== index))}
                  >
                    حذف
                  </Button>
                </div>
              ))}

              {/* افزودن رنگ جدید */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (colors.length > 0 && !colors[colors.length - 1].name) return;
                  field.onChange([...colors, { name: '', hex: '#000000' }]);
                }}
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
