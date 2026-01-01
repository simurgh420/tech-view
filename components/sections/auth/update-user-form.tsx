'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

import { updateUser } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const schema = z
  .object({
    name: z.string().optional(),
    image: z.string().url('Image must be a valid URL').optional().or(z.literal('')),
  })
  .refine(data => data.name || data.image, {
    message: 'Please enter a name or image',
    path: ['name'],
  });

type FormValues = z.infer<typeof schema>;

interface UpdateUserFormProps {
  name: string;
  image: string;
}

export const UpdateUserForm = ({ name, image }: UpdateUserFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name,
      image,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);

    await updateUser({
      ...(values.name && { name: values.name }),
      ...(values.image && { image: values.image }),
      fetchOptions: {
        onSuccess: () => {
          toast.success('User updated successfully');
          router.refresh();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (ctx: any) => {
          toast.error(ctx.error.message);
        },
        onResponse: () => setIsPending(false),
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-sm w-full space-y-6 bg-white p-6 rounded-xl shadow-sm border"
      >
        <h2 className="text-xl font-semibold text-gray-900">Update Profile</h2>
        <p className="text-sm text-gray-500">Change your name or profile image.</p>

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="name">Name</Label>
              <FormControl>
                <Input id="name" placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="image">Image URL</Label>
              <FormControl>
                <Input id="image" placeholder="https://example.com/avatar.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Updating...' : 'Update User'}
        </Button>
      </form>
    </Form>
  );
};
