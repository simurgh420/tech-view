// components/product/form/fields/SpecificationsField.tsx
'use client';

import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Control } from 'react-hook-form';
import { ProductFormValues } from '../product.schema';

type Props = { control: Control<ProductFormValues> };

export function SpecificationsField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="specifications"
      render={({ field }) => {
        const specs = field.value ?? {};

        return (
          <FormItem>
            <FormLabel>مشخصات فنی</FormLabel>

            <div className="space-y-6">
              {Object.entries(specs).map(([groupKey, items]) => (
                <div key={groupKey} className="border p-4 rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      className="text-right"
                      value={groupKey}
                      onChange={e => {
                        const newKey = e.target.value;
                        const updated = structuredClone(specs);
                        updated[newKey] = updated[groupKey];
                        delete updated[groupKey];
                        field.onChange(updated);
                      }}
                    />

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        const updated = structuredClone(specs);
                        delete updated[groupKey];
                        field.onChange(updated);
                      }}
                    >
                      حذف گروه
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <Input
                          className="text-right"
                          placeholder="عنوان ویژگی"
                          value={item.label}
                          onChange={e => {
                            const updated = structuredClone(specs);
                            updated[groupKey][itemIndex].label = e.target.value;
                            field.onChange(updated);
                          }}
                        />

                        <Input
                          className="text-right"
                          placeholder="مقدار"
                          value={item.value}
                          onChange={e => {
                            const updated = structuredClone(specs);
                            updated[groupKey][itemIndex].value = e.target.value;
                            field.onChange(updated);
                          }}
                        />

                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => {
                            const updated = structuredClone(specs);
                            updated[groupKey] = updated[groupKey].filter((_, i) => i !== itemIndex);
                            field.onChange(updated);
                          }}
                        >
                          حذف
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const updated = structuredClone(specs);
                        updated[groupKey].push({ label: '', value: '' });
                        field.onChange(updated);
                      }}
                    >
                      افزودن ویژگی جدید
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const updated = structuredClone(specs);
                  updated[`گروه جدید ${Object.keys(updated).length + 1}`] = [];
                  field.onChange(updated);
                }}
              >
                افزودن گروه جدید
              </Button>
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
