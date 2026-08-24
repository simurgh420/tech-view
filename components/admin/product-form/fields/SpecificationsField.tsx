'use client';

import { useEffect } from 'react';
import { useFieldArray, useWatch, Control } from 'react-hook-form';
import { ProductFormType } from '@/lib/validation/product';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetCategoryAttributes } from '@/hooks/useCategoryAttributes';

type Props = { control: Control<ProductFormType> };

export function SpecificationsField({ control }: Props) {
  const categorySlug = useWatch({ control, name: 'categorySlug' });
  const { data: attributes, isLoading } = useGetCategoryAttributes(categorySlug ?? '');

  const { fields, replace } = useFieldArray({
    control,
    name: 'specifications',
    keyName: 'fieldId',
  });

  useEffect(() => {
    if (!attributes) return;

    const existingByAttrId = new Map(fields.map(f => [f.attributeId, f.value]));

    replace(
      attributes.map(attr => ({
        attributeId: attr.attributeId,
        value: existingByAttrId.get(attr.attributeId) ?? '',
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributes]);

  if (!categorySlug) {
    return (
      <div className="space-y-2">
        <FormLabel>مشخصات فنی</FormLabel>
        <p className="text-sm text-muted-foreground">
          اول یک دسته‌بندی انتخاب کنید تا مشخصات مربوط به آن نمایش داده شود.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <FormLabel>مشخصات فنی</FormLabel>
        <p className="text-sm text-muted-foreground">در حال بارگذاری مشخصات...</p>
      </div>
    );
  }

  if (!attributes || attributes.length === 0) {
    return (
      <div className="space-y-2">
        <FormLabel>مشخصات فنی</FormLabel>
        <p className="text-sm text-muted-foreground">
          هیچ مشخصه‌ای برای این دسته‌بندی تعریف نشده است.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormLabel>مشخصات فنی</FormLabel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, index) => {
          const attr = attributes.find(a => a.attributeId === field.attributeId);
          if (!attr) return null;

          return (
            <FormField
              key={field.fieldId}
              control={control}
              name={`specifications.${index}.value`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal text-muted-foreground">
                    {attr.label}
                    {attr.unit && ` (${attr.unit})`}
                    {attr.isRequired && <span className="text-destructive"> *</span>}
                  </FormLabel>

                  {attr.type === 'ENUM' || attr.type === 'BOOLEAN' ? (
                    <Select value={formField.value} onValueChange={formField.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {(attr.type === 'BOOLEAN' ? ['دارد', 'ندارد'] : attr.options).map(opt => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={attr.type === 'NUMBER' ? 'number' : 'text'}
                      placeholder={`مقدار ${attr.label}`}
                      {...formField}
                    />
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
