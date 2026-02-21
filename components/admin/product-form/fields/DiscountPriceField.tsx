'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { ProductFormValues } from '../product.schema';

type Props = { control: Control<ProductFormValues> };

export function DiscountPriceField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="discountPrice"
      render={({ field }) => (
        <FormItem>
          <FormLabel>قیمت تخفیف</FormLabel>
          <FormControl>
            <Input
              type="text"
              inputMode="numeric"
              value={field.value ? new Intl.NumberFormat('en-US').format(field.value) : ''}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '');
                field.onChange(raw ? Number(raw) : null);
              }}
              placeholder="مثلاً: 950,000"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
