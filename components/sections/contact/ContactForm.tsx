'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { useContact } from '@/hooks/useContact';
import { toast } from 'sonner';
import { ContactFormValues, contactSchema } from '@/lib/validation/contact.';

export function ContactForm() {
  const { useCreateContact } = useContact();
  const createContact = useCreateContact();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    createContact.mutate(data, {
      onSuccess: () => {
        form.reset();
        toast.success('پیام شما با موفقیت ارسال شد.');
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'خطایی در ارسال پیام رخ داد.');
      },
    });
  };

  return (
    <section className="p-8 rounded-2xl border border-white/10  mb-12  [direction:rtl]">
      <h2 className="text-xl font-semibold  mb-6">فرم تماس با ما</h2>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* نام */}
        <div>
          <Input
            {...form.register('name')}
            placeholder="نام و نام خانوادگی"
            disabled={createContact.isPending}
            className="
            border border-white/10 
              rounded-xl px-4 py-3 
               focus-visible:ring-1
              transition disabled:opacity-50
            "
          />
          {form.formState.errors.name && (
            <p className="text-red-400 text-xs pr-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* ایمیل */}
        <div>
          <Input
            {...form.register('email')}
            placeholder="ایمیل"
            disabled={createContact.isPending}
            className="
             border border-white/10 
              rounded-xl px-4 py-3 
                   focus-visible:ring-1
              transition disabled:opacity-50
            "
          />
          {form.formState.errors.email && (
            <p className="text-red-400 text-xs pr-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* شماره تماس */}
        <div>
          <Input
            {...form.register('phone')}
            placeholder="شماره تماس"
            disabled={createContact.isPending}
            className="
               border border-white/10 
              rounded-xl px-4 py-3 
                  focus-visible:ring-1
              transition disabled:opacity-50
            "
          />
          {form.formState.errors.phone && (
            <p className="text-red-400 text-xs pr-1">{form.formState.errors.phone.message}</p>
          )}
        </div>

        {/* موضوع پیام */}
        <div>
          <Input
            {...form.register('subject')}
            placeholder="موضوع پیام"
            disabled={createContact.isPending}
            className="
              border border-white/10 
              rounded-xl px-4 py-3 
                   focus-visible:ring-1
              transition disabled:opacity-50
            "
          />
          {form.formState.errors.subject && (
            <p className="text-red-400 text-xs pr-1">{form.formState.errors.subject.message}</p>
          )}
        </div>

        {/* متن پیام */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <Textarea
            {...form.register('message')}
            placeholder="متن پیام شما..."
            disabled={createContact.isPending}
            className="
              h-25 w-full border border-white/10 
              rounded-xl px-4 py-3 
                   focus-visible:ring-0 focus-visible:border-e-blue-600
              transition disabled:opacity-50
            "
          />
          {form.formState.errors.message && (
            <p className="text-red-400 text-xs pr-1">{form.formState.errors.message.message}</p>
          )}
        </div>

        {/* دکمه ارسال */}
        <Button
          type="submit"
          disabled={createContact.isPending}
          variant={'ghost'}
          className="
            md:col-span-2 mt-4 py-3 rounded-xl
          "
        >
          {createContact.isPending ? 'در حال ارسال...' : 'ارسال پیام'}
        </Button>
      </form>
    </section>
  );
}
