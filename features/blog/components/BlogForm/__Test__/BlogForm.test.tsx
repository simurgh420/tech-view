// features/blog/components/BlogForm/__Test__/BlogForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';

vi.mock('@/components/editors/EditorClient', () => ({
  default: ({ value, onChange, slug, ...rest }: any) => (
    <textarea
      data-testid="editor"
      data-slug={slug}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      {...rest}
    />
  ),
}));

vi.mock('@/components/sections/image/ImageUploader', () => ({
  ImageUploader: ({ initialUrl, onChange, ...rest }: any) => (
    <div data-testid="uploader" data-initial-url={initialUrl ?? ''} {...rest}>
      <button
        type="button"
        onClick={() => onChange(new File(['x'], 'cover.png', { type: 'image/png' }))}
      >
        pick
      </button>
    </div>
  ),
}));

vi.mock('@/components/Tags/TagsInput', () => ({
  TagsInput: ({ value, onChange, ...rest }: any) => (
    <div data-testid="tags" data-value={JSON.stringify(value)} {...rest}>
      <button type="button" onClick={() => onChange([...value, 'new-tag'])}>
        add
      </button>
    </div>
  ),
}));

vi.mock('@/lib/slug-common', () => ({
  toSlug: vi.fn((s: string) => s.trim().toLowerCase().replace(/\s+/g, '-')),
}));

import { toSlug } from '@/lib/slug-common';
import { BlogForm } from '../BlogForm';
import { FormHarness, testBlogSchema } from './harness';

// ─── ابزارهای کمکی ───────────────────────────────────────

const onSubmit = vi.fn();

let form: UseFormReturn<any>;
const capture = (f: UseFormReturn<any>) => {
  form = f;
};

const validValues = {
  title: 'عنوان تستی',
  excerpt: 'خلاصه تستی بلاگ',
  content: '<p>محتوا</p>',
  tags: ['موبایل'],
};

const initialValues = {
  title: 'عنوان تستی',
  excerpt: 'خلاصه تستی بلاگ',
  coverImageUrl: '/uploads/blogs/x/cover/a.png' as string | null,
  content: '<p>محتوا</p>',
  tags: ['موبایل'],
};

function renderBlogForm(
  opts: {
    defaultValues?: Record<string, unknown>;
    initialValues?: typeof initialValues;
    isLoading?: boolean;
    schema?: any;
  } = {}
) {
  return render(
    <FormHarness
      wrap={false}
      defaultValues={opts.defaultValues}
      schema={opts.schema ?? testBlogSchema}
      onForm={capture}
    >
      {f => (
        <BlogForm
          form={f as any}
          initialValues={opts.initialValues}
          onSubmit={onSubmit}
          isLoading={opts.isLoading}
        />
      )}
    </FormHarness>
  );
}

const type = (el: HTMLElement, value: string) => fireEvent.change(el, { target: { value } });
const submitButton = (name = 'ثبت بلاگ') => screen.getByRole('button', { name });

describe('BlogForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═════════════════════════════════════════════════════
  // رندر
  // ═════════════════════════════════════════════════════
  describe('رندر', () => {
    it('should render all five sections', () => {
      renderBlogForm();

      expect(screen.getByLabelText('عنوان')).toBeInTheDocument();
      expect(screen.getByLabelText('خلاصه')).toBeInTheDocument();
      expect(screen.getByText('تصویر کاور')).toBeInTheDocument();
      expect(screen.getByTestId('editor')).toBeInTheDocument();
      expect(screen.getByTestId('tags')).toBeInTheDocument();
    });

    it('should render the form as RTL with spacing between sections', () => {
      const { container } = renderBlogForm();

      const formEl = container.querySelector('form')!;
      expect(formEl).toHaveAttribute('dir', 'rtl');
      expect(formEl).toHaveClass('space-y-8');
    });

    it('should render the sections in order: title, excerpt, cover, content, tags', () => {
      const { container } = renderBlogForm();

      const text = container.querySelector('form')!.textContent!;
      const order = ['عنوان', 'خلاصه', 'تصویر کاور', 'محتوا', 'تگ‌ها'].map(l => text.indexOf(l));
      expect(order).toEqual([...order].sort((a, b) => a - b));
      expect(order.every(i => i >= 0)).toBe(true);
    });
  });

  // ═════════════════════════════════════════════════════
  // دکمه ثبت
  // ═════════════════════════════════════════════════════
  describe('دکمه ثبت', () => {
    it('should show the create label without initialValues', () => {
      renderBlogForm();

      expect(submitButton('ثبت بلاگ')).toBeEnabled();
      expect(submitButton('ثبت بلاگ')).toHaveAttribute('type', 'submit');
    });

    it('should show the edit label with initialValues', () => {
      renderBlogForm({ initialValues });

      expect(submitButton('ویرایش بلاگ')).toBeEnabled();
      expect(screen.queryByRole('button', { name: 'ثبت بلاگ' })).not.toBeInTheDocument();
    });

    it.each([
      ['create', undefined],
      ['edit', initialValues],
    ])('should be disabled with the saving label while loading (%s)', (_mode, iv) => {
      renderBlogForm({ isLoading: true, initialValues: iv });

      expect(screen.getByRole('button', { name: 'در حال ذخیره...' })).toBeDisabled();
    });

    it('should be enabled when isLoading is false or omitted', () => {
      renderBlogForm({ isLoading: false });

      expect(submitButton()).toBeEnabled();
    });
  });

  // ═════════════════════════════════════════════════════
  // slug
  // ═════════════════════════════════════════════════════
  describe('slug ویرایشگر', () => {
    it('should pass an empty slug while the title is empty', () => {
      renderBlogForm();

      expect(toSlug).toHaveBeenCalledWith('');
      expect(screen.getByTestId('editor')).toHaveAttribute('data-slug', '');
    });

    it('should derive the slug from the initial title', () => {
      renderBlogForm({ defaultValues: { title: 'My Post' } });

      expect(screen.getByTestId('editor')).toHaveAttribute('data-slug', 'my-post');
    });

    it('should update the slug live while typing the title', () => {
      renderBlogForm();

      type(screen.getByLabelText('عنوان'), 'Hello World');

      expect(screen.getByTestId('editor')).toHaveAttribute('data-slug', 'hello-world');
    });

    it('should call toSlug with the current title', () => {
      renderBlogForm();

      type(screen.getByLabelText('عنوان'), 'abc def');

      expect(toSlug).toHaveBeenLastCalledWith('abc def');
    });
  });

  // ═════════════════════════════════════════════════════
  // اتصال sectionها به فرم
  // ═════════════════════════════════════════════════════
  describe('اتصال sectionها', () => {
    it('should pass initialValues.coverImageUrl to the uploader', () => {
      renderBlogForm({ initialValues });

      expect(screen.getByTestId('uploader')).toHaveAttribute(
        'data-initial-url',
        '/uploads/blogs/x/cover/a.png'
      );
    });

    it('should pass null to the uploader without initialValues', () => {
      renderBlogForm();

      expect(screen.getByTestId('uploader')).toHaveAttribute('data-initial-url', '');
    });

    it('should pass null to the uploader when the post has no cover', () => {
      renderBlogForm({ initialValues: { ...initialValues, coverImageUrl: null } });

      expect(screen.getByTestId('uploader')).toHaveAttribute('data-initial-url', '');
    });

    it('should write every section into the same form', () => {
      renderBlogForm();

      type(screen.getByLabelText('عنوان'), 'عنوان جدید');
      type(screen.getByLabelText('خلاصه'), 'خلاصه جدید');
      type(screen.getByTestId('editor'), '<p>متن</p>');
      fireEvent.click(screen.getByText('add'));
      fireEvent.click(screen.getByText('pick'));

      expect(form.getValues()).toMatchObject({
        title: 'عنوان جدید',
        excerpt: 'خلاصه جدید',
        content: '<p>متن</p>',
        tags: ['new-tag'],
      });
      expect(form.getValues('coverImageUrl')).toBeInstanceOf(File);
    });

    it('should show the form values (not initialValues) in the fields (see notes)', () => {
      renderBlogForm({ initialValues, defaultValues: { title: 'از defaultValues' } });

      expect(screen.getByLabelText('عنوان')).toHaveValue('از defaultValues');
    });
  });

  // ═════════════════════════════════════════════════════
  // ثبت فرم
  // ═════════════════════════════════════════════════════
  describe('ثبت', () => {
    it('should call onSubmit with the form data when valid', async () => {
      renderBlogForm({ defaultValues: validValues });

      fireEvent.click(submitButton());

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit.mock.calls[0][0]).toMatchObject(validValues);
    });

    it('should submit edited values', async () => {
      renderBlogForm({ defaultValues: validValues });
      type(screen.getByLabelText('عنوان'), 'عنوان ویرایش‌شده');
      fireEvent.click(screen.getByText('add'));

      fireEvent.click(submitButton());

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit.mock.calls[0][0]).toMatchObject({
        title: 'عنوان ویرایش‌شده',
        tags: ['موبایل', 'new-tag'],
      });
    });

    it('should submit the selected cover File', async () => {
      renderBlogForm({ defaultValues: validValues });
      fireEvent.click(screen.getByText('pick'));

      fireEvent.click(submitButton());

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit.mock.calls[0][0].coverImageUrl).toBeInstanceOf(File);
    });

    it('should NOT call onSubmit and should show errors when invalid', async () => {
      renderBlogForm();

      fireEvent.click(submitButton());

      expect(await screen.findByText('عنوان کوتاه است')).toBeInTheDocument();
      expect(screen.getByText('خلاصه کوتاه است')).toBeInTheDocument();
      expect(screen.getByText('محتوا الزامی است')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should submit once the errors are fixed', async () => {
      renderBlogForm();
      fireEvent.click(submitButton());
      await screen.findByText('عنوان کوتاه است');

      type(screen.getByLabelText('عنوان'), 'عنوان درست');
      type(screen.getByLabelText('خلاصه'), 'خلاصه درست');
      type(screen.getByTestId('editor'), '<p>x</p>');
      fireEvent.click(submitButton());

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    });

    it('should NOT submit by clicking the disabled button while loading', async () => {
      renderBlogForm({ defaultValues: validValues, isLoading: true });

      fireEvent.click(screen.getByRole('button', { name: 'در حال ذخیره...' }));
      await new Promise(r => setTimeout(r, 20));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should still submit via the form submit event while loading (see notes)', async () => {
      const { container } = renderBlogForm({ defaultValues: validValues, isLoading: true });

      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    });

    it('should not submit on mount', () => {
      renderBlogForm({ defaultValues: validValues });

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
