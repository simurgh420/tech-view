'use client';

import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Control } from 'react-hook-form';
import { ProductFormValues } from '../product.schema';

type Props = { control: Control<ProductFormValues> };

export function VariantsField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="variants"
      render={({ field }) => {
        const variants = field.value ?? [];

        return (
          <FormItem>
            <FormLabel>تنوع‌ها (RAM / Storage)</FormLabel>

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="RAM"
                    value={variant.ram}
                    onChange={e => {
                      const updated = [...variants];
                      updated[index].ram = e.target.value;
                      field.onChange(updated);
                    }}
                  />

                  <Input
                    placeholder="Storage"
                    value={variant.storage}
                    onChange={e => {
                      const updated = [...variants];
                      updated[index].storage = e.target.value;
                      field.onChange(updated);
                    }}
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => field.onChange(variants.filter((_, i) => i !== index))}
                  >
                    حذف
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                onClick={() => field.onChange([...variants, { ram: '', storage: '' }])}
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
