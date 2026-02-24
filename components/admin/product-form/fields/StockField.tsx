'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { ProductFormValues } from '../product.schema';

type Props = { control: Control<ProductFormValues> };

export function StockField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="stockQuantity"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="stockQuantity">موجودی انبار</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                id="stockQuantity"
                type="text"
                inputMode="numeric"
                className="pl-12"
                value={
                  field.value !== null && field.value !== undefined
                    ? new Intl.NumberFormat('en-US').format(field.value)
                    : ''
                }
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, '');
                  field.onChange(raw ? Number(raw) : 0);
                }}
                placeholder="مثلاً: 150"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                عدد
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
