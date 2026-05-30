'use client';

import { useFieldArray, Control } from 'react-hook-form';
import { ProductFormType } from '@/lib/validation/product';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Props = { control: Control<ProductFormType> };

export function SpecificationsField({ control }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specifications',
  });

  return (
    <div className="space-y-6">
      <FormLabel>مشخصات فنی</FormLabel>

      {fields.map((group, groupIndex) => (
        <div key={group.id} className="border p-4 rounded-lg space-y-4">
          {/* نام گروه */}
          <FormField
            control={control}
            name={`specifications.${groupIndex}.group`}
            render={({ field }) => (
              <FormItem>
                <Input placeholder="نام گروه (مثلاً: پردازنده)" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* آیتم‌ها */}
          <ItemsField control={control} groupIndex={groupIndex} />

          <Button type="button" variant="destructive" size="sm" onClick={() => remove(groupIndex)}>
            حذف گروه
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({ group: '', items: [] })}
      >
        افزودن گروه جدید
      </Button>
    </div>
  );
}

function ItemsField({
  control,
  groupIndex,
}: {
  control: Control<ProductFormType>;
  groupIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `specifications.${groupIndex}.items`,
  });

  return (
    <div className="space-y-3">
      {fields.map((item, itemIndex) => (
        <div key={item.id} className="flex items-center gap-2">
          <FormField
            control={control}
            name={`specifications.${groupIndex}.items.${itemIndex}.label`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <Input placeholder="عنوان ویژگی" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`specifications.${groupIndex}.items.${itemIndex}.value`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <Input placeholder="مقدار" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="button" variant="destructive" size="sm" onClick={() => remove(itemIndex)}>
            حذف
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({ label: '', value: '' })}
      >
        افزودن ویژگی جدید
      </Button>
    </div>
  );
}
