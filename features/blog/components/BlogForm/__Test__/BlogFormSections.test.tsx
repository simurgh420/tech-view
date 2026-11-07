// features/blog/components/BlogForm/__Test__/BlogFormSections.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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
      <button type="button" onClick={() => onChange(null)}>
        clear
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
      <button type="button" onClick={() => onChange([])}>
        reset
      </button>
    </div>
  ),
}));

import { BlogTitleSection } from '../BlogTitleSection';
import { BlogExcerptSection } from '../BlogExcerptSection';
import { BlogCoverSection } from '../BlogCoverSection';
import { BlogContentSection } from '../BlogContentSection';
import { BlogTagsSection } from '../BlogTagsSection';
import { FormHarness, testBlogSchema } from './harness';

// ─── ابزارهای کمکی ───────────────────────────────────────

let form: UseFormReturn<any>;
const capture = (f: UseFormReturn<any>) => {
  form = f;
};

function renderSection(
  section: (f: UseFormReturn<any>) => React.ReactNode,
  opts: { defaultValues?: Record<string, unknown>; schema?: any } = {}
) {
  return render(
    <FormHarness defaultValues={opts.defaultValues} schema={opts.schema} onForm={capture}>
      {section}
    </FormHarness>
  );
}

const validate = (name?: string) =>
  act(async () => {
    await form.trigger(name as any);
  });

const type = (el: HTMLElement, value: string) => fireEvent.change(el, { target: { value } });

describe('BlogForm sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═════════════════════════════════════════════════════
  // BlogTitleSection
  // ═════════════════════════════════════════════════════
  describe('BlogTitleSection', () => {
    const render_ = (o = {}) => renderSection(f => <BlogTitleSection control={f.control} />, o);

    it('should render the label and an input with the placeholder', () => {
      render_();

      const input = screen.getByLabelText('عنوان');
      expect(input).toHaveAttribute('placeholder', 'مثلاً: تجربه من با هدفون‌های استریو');
      expect(input).toHaveClass('text-right');
    });

    it('should show the current form value', () => {
      render_({ defaultValues: { title: 'عنوان اولیه' } });

      expect(screen.getByLabelText('عنوان')).toHaveValue('عنوان اولیه');
    });

    it('should write typed text to the "title" field', () => {
      render_();

      type(screen.getByLabelText('عنوان'), 'عنوان جدید');

      expect(form.getValues('title')).toBe('عنوان جدید');
      expect(screen.getByLabelText('عنوان')).toHaveValue('عنوان جدید');
    });

    it('should NOT show an error before validation', () => {
      render_({ schema: testBlogSchema });

      expect(screen.queryByText('عنوان کوتاه است')).not.toBeInTheDocument();
      expect(screen.getByLabelText('عنوان')).toHaveAttribute('aria-invalid', 'false');
    });

    it('should show the validation message and mark the input invalid', async () => {
      render_({ schema: testBlogSchema, defaultValues: { title: 'ab' } });

      await validate('title');

      expect(await screen.findByText('عنوان کوتاه است')).toBeInTheDocument();
      expect(screen.getByLabelText('عنوان')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should clear the message once the value becomes valid', async () => {
      render_({ schema: testBlogSchema, defaultValues: { title: 'ab' } });
      await validate('title');
      await screen.findByText('عنوان کوتاه است');

      type(screen.getByLabelText('عنوان'), 'عنوان معتبر');
      await validate('title');

      expect(screen.queryByText('عنوان کوتاه است')).not.toBeInTheDocument();
    });
  });

  // ═════════════════════════════════════════════════════
  // BlogExcerptSection
  // ═════════════════════════════════════════════════════
  describe('BlogExcerptSection', () => {
    const render_ = (o = {}) => renderSection(f => <BlogExcerptSection control={f.control} />, o);

    it('should render a 3-row textarea with the placeholder', () => {
      render_();

      const textarea = screen.getByLabelText('خلاصه');
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('rows', '3');
      expect(textarea).toHaveAttribute('placeholder', 'یک توضیح کوتاه درباره بلاگ...');
      expect(textarea).toHaveClass('text-right');
    });

    it('should show the current value', () => {
      render_({ defaultValues: { excerpt: 'خلاصه اولیه' } });

      expect(screen.getByLabelText('خلاصه')).toHaveValue('خلاصه اولیه');
    });

    it('should write typed text to the "excerpt" field', () => {
      render_();

      type(screen.getByLabelText('خلاصه'), 'یک خلاصه');

      expect(form.getValues('excerpt')).toBe('یک خلاصه');
    });

    it('should show the validation message', async () => {
      render_({ schema: testBlogSchema, defaultValues: { excerpt: 'abc' } });

      await validate('excerpt');

      expect(await screen.findByText('خلاصه کوتاه است')).toBeInTheDocument();
    });
  });

  // ═════════════════════════════════════════════════════
  // BlogCoverSection
  // ═════════════════════════════════════════════════════
  describe('BlogCoverSection', () => {
    const render_ = (initialUrl: string | null = null, o = {}) =>
      renderSection(f => <BlogCoverSection control={f.control} initialUrl={initialUrl} />, o);

    it('should render the label and the uploader', () => {
      render_();

      expect(screen.getByText('تصویر کاور')).toBeInTheDocument();
      expect(screen.getByTestId('uploader')).toBeInTheDocument();
    });

    it('should pass initialUrl to the uploader', () => {
      render_('/uploads/blogs/x/cover/a.png');

      expect(screen.getByTestId('uploader')).toHaveAttribute(
        'data-initial-url',
        '/uploads/blogs/x/cover/a.png'
      );
    });

    it('should pass null initialUrl as "no image"', () => {
      render_(null);

      expect(screen.getByTestId('uploader')).toHaveAttribute('data-initial-url', '');
    });

    it('should write the selected File to the "coverImageUrl" field', () => {
      render_();

      fireEvent.click(screen.getByText('pick'));

      const value = form.getValues('coverImageUrl');
      expect(value).toBeInstanceOf(File);
      expect((value as File).name).toBe('cover.png');
    });

    it('should write null when the uploader clears the image', () => {
      render_();
      fireEvent.click(screen.getByText('pick'));

      fireEvent.click(screen.getByText('clear'));

      expect(form.getValues('coverImageUrl')).toBeNull();
    });

    it('should NOT touch the form value on render', () => {
      render_('/uploads/a.png');

      expect(form.getValues('coverImageUrl')).toBeNull();
    });
  });

  // ═════════════════════════════════════════════════════
  // BlogContentSection
  // ═════════════════════════════════════════════════════
  describe('BlogContentSection', () => {
    const render_ = (slug = 'my-post', o = {}) =>
      renderSection(f => <BlogContentSection control={f.control} slug={slug} />, o);

    it('should render the label and the editor', () => {
      render_();

      expect(screen.getByText('محتوا')).toBeInTheDocument();
      expect(screen.getByTestId('editor')).toBeInTheDocument();
    });

    it('should show the current content', () => {
      render_('s', { defaultValues: { content: '<p>سلام</p>' } });

      expect(screen.getByTestId('editor')).toHaveValue('<p>سلام</p>');
    });

    it('should pass the slug to the editor', () => {
      render_('my-post');

      expect(screen.getByTestId('editor')).toHaveAttribute('data-slug', 'my-post');
    });

    it('should pass an empty slug as-is (see notes)', () => {
      render_('');

      expect(screen.getByTestId('editor')).toHaveAttribute('data-slug', '');
    });

    it('should update the slug prop when the parent re-renders', () => {
      const ui = (slug: string) => (
        <FormHarness onForm={capture}>
          {f => <BlogContentSection control={f.control} slug={slug} />}
        </FormHarness>
      );
      const { rerender } = render(ui('first'));

      rerender(ui('second'));

      expect(screen.getByTestId('editor')).toHaveAttribute('data-slug', 'second');
    });

    it('should write editor changes to the "content" field', () => {
      render_();

      type(screen.getByTestId('editor'), '<p>متن جدید</p>');

      expect(form.getValues('content')).toBe('<p>متن جدید</p>');
    });

    it('should show the validation message', async () => {
      render_('s', { schema: testBlogSchema });

      await validate('content');

      expect(await screen.findByText('محتوا الزامی است')).toBeInTheDocument();
    });
  });

  // ═════════════════════════════════════════════════════
  // BlogTagsSection
  // ═════════════════════════════════════════════════════
  describe('BlogTagsSection', () => {
    const render_ = (o = {}) => renderSection(f => <BlogTagsSection control={f.control} />, o);

    it('should render the label and the tags input', () => {
      render_();

      expect(screen.getByText('تگ‌ها')).toBeInTheDocument();
      expect(screen.getByTestId('tags')).toBeInTheDocument();
    });

    it('should pass the current tags', () => {
      render_({ defaultValues: { tags: ['موبایل', 'لپ‌تاپ'] } });

      expect(screen.getByTestId('tags')).toHaveAttribute(
        'data-value',
        JSON.stringify(['موبایل', 'لپ‌تاپ'])
      );
    });

    it('should pass an empty array when tags is empty', () => {
      render_();

      expect(screen.getByTestId('tags')).toHaveAttribute('data-value', '[]');
    });

    it('should fall back to an empty array when tags is undefined', () => {
      render_({ defaultValues: { tags: undefined } });

      expect(screen.getByTestId('tags')).toHaveAttribute('data-value', '[]');
    });

    it('should write added tags to the "tags" field', () => {
      render_({ defaultValues: { tags: ['a'] } });

      fireEvent.click(screen.getByText('add'));

      expect(form.getValues('tags')).toEqual(['a', 'new-tag']);
    });

    it('should write an empty array when tags are reset', () => {
      render_({ defaultValues: { tags: ['a', 'b'] } });

      fireEvent.click(screen.getByText('reset'));

      expect(form.getValues('tags')).toEqual([]);
    });
  });
});
