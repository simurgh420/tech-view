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
          <FormLabel>موجودی انبار</FormLabel>
          <FormControl>
            <Input
              type="text"
              inputMode="numeric"
              value={field.value ? new Intl.NumberFormat('en-US').format(field.value) : ''}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '');
                field.onChange(raw ? Number(raw) : 0);
              }}
              placeholder="مثلاً: 150"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
