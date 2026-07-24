'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { ProductFormType } from '@/lib/validation/product';
import { formatPrice } from '@/lib/formatPrice';

const formatFieldValue = (value: number | null | undefined) =>
  value !== null && value !== undefined ? formatPrice(value) : '';

type Props = { control: Control<ProductFormType> };

export function PriceField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="price"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="price">قیمت</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                id="price"
                type="text"
                inputMode="numeric"
                dir="ltr"
                className="ps-12 text-end"
                value={formatFieldValue(field.value)}
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, '');
                  field.onChange(raw ? Number(raw) : 0);
                }}
                placeholder="مثلاً: 1,250,000"
              />
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                تومان
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
