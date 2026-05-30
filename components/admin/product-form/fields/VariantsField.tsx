'use client';

import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Control } from 'react-hook-form';
import { ProductFormType } from '@/lib/validation/product';

type Props = { control: Control<ProductFormType> };

export function VariantsField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="variants"
      render={({ field }) => {
        const variants = Array.isArray(field.value) ? field.value : [];

        return (
          <FormItem>
            <FormLabel>تنوع‌ها (RAM / Storage)</FormLabel>

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* RAM */}
                  <Input
                    id={`variant-ram-${index}`}
                    placeholder="RAM (مثلاً: 8GB)"
                    value={variant.ram}
                    onChange={e => {
                      const updated = [...variants];
                      updated[index] = { ...updated[index], ram: e.target.value };
                      field.onChange(updated);
                    }}
                  />

                  {/* Storage */}
                  <Input
                    id={`variant-storage-${index}`}
                    placeholder="Storage (مثلاً: 256GB)"
                    value={variant.storage}
                    onChange={e => {
                      const updated = [...variants];
                      updated[index] = { ...updated[index], storage: e.target.value };
                      field.onChange(updated);
                    }}
                  />

                  {/* حذف */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => field.onChange(variants.filter((_, i) => i !== index))}
                  >
                    حذف
                  </Button>
                </div>
              ))}

              {/* افزودن تنوع جدید */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const last = variants[variants.length - 1];
                  if (last && (!last.ram || !last.storage)) return;
                  field.onChange([...variants, { ram: '', storage: '' }]);
                }}
              >
                افزودن تنوع جدید
              </Button>
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
