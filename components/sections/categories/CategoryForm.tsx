'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconPicker } from './IconPicker';
import { CategoryActions } from './CategoryActions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createCategorySchema,
  editCategorySchema,
  CreateCategoryInput,
  EditCategoryInput,
} from '@/lib/validation/category';
import type { CategoryFormProps } from '@/types/category';

export function CategoryForm(props: CategoryFormProps) {
  const { mode, initialValues, onSubmit, isLoading, parents, slug } = props;

  // انتخاب اسکیمای دقیق بر اساس mode
  const schema = mode === 'create' ? createCategorySchema : editCategorySchema;
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialValues?.title ?? '',
      icon: initialValues?.icon ?? null,
      parentId: initialValues?.parentId ?? null,
    },
  });

  const handleFormSubmit = (data: FormData) => {
    if (mode === 'edit') {
      const payload: EditCategoryInput = {
        ...data,
        icon: data.icon === '' ? null : data.icon,
        parentId: data.parentId === '' ? null : data.parentId,
      };
      (onSubmit as (data: EditCategoryInput) => void)(payload);
    } else {
      (onSubmit as (data: CreateCategoryInput) => void)(data as CreateCategoryInput);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="mx-auto max-w-lg rounded-lg shadow-md p-6 space-y-6"
        dir="rtl"
      >
        {/* عنوان */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان کتگوری</FormLabel>
              <FormControl>
                <Input placeholder="مثلاً: پوشاک" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* آیکون */}
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>آیکون</FormLabel>
              <FormControl>
                <IconPicker value={field.value ?? ''} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* والد */}
        {parents && parents.length > 0 && (
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>دسته والد</FormLabel>
                <Select
                  value={field.value ?? ''}
                  onValueChange={value => field.onChange(value === '' ? null : value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="بدون والد" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">بدون والد</SelectItem>
                    {parents.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* دکمه‌ها */}
        <div className="flex justify-between items-center pt-4 border-t">
          {slug && <CategoryActions slug={slug} />}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'در حال ذخیره…' : mode === 'edit' ? 'ویرایش' : 'ذخیره'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
