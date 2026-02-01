'use client';

import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { Input } from '@/components/ui/input';

import { CategoryActions } from './CategoryActions';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconPicker } from './IconPicker';

const categorySchema = z.object({
  title: z.string().min(2, 'عنوان کتگوری باید حداقل ۲ کاراکتر باشد'),
  icon: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

type Props = {
  initialValues?: Partial<CategoryFormValues>;
  onSubmit: SubmitHandler<CategoryFormValues>;
  isLoading?: boolean;
  parents?: { id: string; title: string }[];
  slug?: string;
};

export function CategoryForm({ initialValues, onSubmit, isLoading, parents, slug }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      icon: initialValues?.icon ?? '',
      parentId: initialValues?.parentId ?? null,
    },
  });

  const parent = useWatch({ control: control, name: 'parentId' });
  const icon = useWatch({ control, name: 'icon' });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-lg  rounded-lg shadow-md p-6 space-y-6"
      dir="rtl"
    >
      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">عنوان کتگوری</label>
        <Input {...register('title')} placeholder="مثلاً: پوشاک" />
        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
      </div>

      {/* Icon */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">آیکون</label>
        <IconPicker value={icon ?? ''} onChange={val => setValue('icon', val)} />
        {errors.icon && <p className="text-red-500 text-xs mt-1">{errors.icon.message}</p>}
      </div>

      {/* Parent */}
      {parents && parents.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">دسته والد</label>
          <Select
            value={parent ?? ''}
            onValueChange={value => setValue('parentId', value === '' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="بدون والد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">بدون والد</SelectItem>
              {parents.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.parentId && <p className="text-red-500 text-xs">{errors.parentId.message}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        {slug && <CategoryActions slug={slug} />}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'در حال ذخیره…' : 'ذخیره'}
        </Button>
      </div>
    </form>
  );
}
