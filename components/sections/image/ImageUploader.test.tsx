// components/sections/image/ImageUploader.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('next/image', () => ({
  default: ({ fill, unoptimized, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} />
  ),
}));

import { ImageUploader } from './ImageUploader';

const originalCreate = URL.createObjectURL;
const originalRevoke = URL.revokeObjectURL;
const create = vi.fn();
const revoke = vi.fn();
let counter = 0;

const onChange = vi.fn();
const onMultipleChange = vi.fn();
const onExistingUrlsChange = vi.fn();

const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement;
const createFile = (name = 'a.png', type = 'image/png') => new File(['x'], name, { type });
const select = (c: HTMLElement, files: File[]) =>
  fireEvent.change(fileInput(c), { target: { files } });
const labelOf = (text: string) => screen.getByText(text).closest('label')!;
const removeSingleBtn = () => screen.getByRole('button', { name: 'حذف تصویر' });
const preview = () => screen.getByAltText('پیش‌نمایش تصویر');
const gallerySrcs = () => screen.getAllByRole('img').map(i => i.getAttribute('src'));

describe('ImageUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    counter = 0;
    create.mockImplementation(() => `blob:mock-${++counter}`);
    URL.createObjectURL = create as any;
    URL.revokeObjectURL = revoke as any;
  });

  afterEach(() => {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  // ═════════════════════════════════════════════════════
  // حالت تک‌تصویری
  // ═════════════════════════════════════════════════════
  describe('single mode', () => {
    describe('رندر اولیه', () => {
      it('should render the upload label and no preview without an image', () => {
        render(<ImageUploader onChange={onChange} />);

        expect(screen.getByText('آپلود تصویر')).toBeInTheDocument();
        expect(screen.queryByAltText('پیش‌نمایش تصویر')).not.toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(labelOf('آپلود تصویر')).toHaveClass('bg-green-600');
      });

      it('should render an image input that is accessible (sr-only), accepts images and is NOT multiple', () => {
        const { container } = render(<ImageUploader onChange={onChange} />);

        const input = fileInput(container);
        expect(input).toHaveAttribute('accept', 'image/*');
        expect(input).toHaveClass('sr-only');
        expect(input).not.toHaveClass('hidden');
        expect(input).not.toHaveAttribute('multiple');
      });

      it('should connect the label to the input', () => {
        const { container } = render(<ImageUploader onChange={onChange} />);

        expect(screen.getByLabelText('آپلود تصویر')).toBe(fileInput(container));
      });

      it('should show initialUrl as the preview and switch the label', () => {
        render(<ImageUploader initialUrl="/uploads/a.png" onChange={onChange} />);

        expect(preview()).toHaveAttribute('src', '/uploads/a.png');
        expect(screen.getByText('تغییر تصویر')).toBeInTheDocument();
        expect(labelOf('تغییر تصویر')).toHaveClass('bg-orange-600');
      });

      it.each([null, undefined, ''])('should show no preview for initialUrl %j', initialUrl => {
        render(<ImageUploader initialUrl={initialUrl as any} onChange={onChange} />);

        expect(screen.queryByAltText('پیش‌نمایش تصویر')).not.toBeInTheDocument();
      });

      it('should NOT call any callback or create object URLs on render', () => {
        render(<ImageUploader initialUrl="/a.png" onChange={onChange} />);

        expect(onChange).not.toHaveBeenCalled();
        expect(create).not.toHaveBeenCalled();
      });

      it('should follow initialUrl when it changes', () => {
        const { rerender } = render(<ImageUploader initialUrl="/a.png" onChange={onChange} />);

        rerender(<ImageUploader initialUrl="/b.png" onChange={onChange} />);

        expect(preview()).toHaveAttribute('src', '/b.png');
      });

      it('should render the remove button as type="button" with an accessible name', () => {
        render(<ImageUploader initialUrl="/a.png" onChange={onChange} />);

        expect(removeSingleBtn()).toHaveAttribute('type', 'button');
      });
    });

    describe('انتخاب فایل', () => {
      it('should call onChange with the selected file', () => {
        const { container } = render(<ImageUploader onChange={onChange} />);
        const file = createFile();

        select(container, [file]);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(file);
        expect(onMultipleChange).not.toHaveBeenCalled();
      });

      it('should show a blob preview and switch the label', () => {
        const { container } = render(<ImageUploader onChange={onChange} />);
        const file = createFile();

        select(container, [file]);

        expect(create).toHaveBeenCalledWith(file);
        expect(preview()).toHaveAttribute('src', 'blob:mock-1');
        expect(labelOf('تغییر تصویر')).toHaveClass('bg-orange-600');
      });

      it('should prefer the local preview over initialUrl', () => {
        const { container } = render(<ImageUploader initialUrl="/old.png" onChange={onChange} />);

        select(container, [createFile()]);

        expect(preview()).toHaveAttribute('src', 'blob:mock-1');
      });

      it('should only use the first file when several are selected', () => {
        const { container } = render(<ImageUploader onChange={onChange} />);
        const first = createFile('1.png');

        select(container, [first, createFile('2.png')]);

        expect(onChange).toHaveBeenCalledWith(first);
        expect(create).toHaveBeenCalledTimes(1);
      });

      it('should ignore an empty selection (user canceled the dialog)', () => {
        const { container } = render(<ImageUploader onChange={onChange} />);

        select(container, []);

        expect(onChange).not.toHaveBeenCalled();
        expect(create).not.toHaveBeenCalled();
      });

      it('should replace the preview and release only the OLD blob', () => {
        const { container } = render(<ImageUploader onChange={onChange} />);

        select(container, [createFile('1.png')]);
        select(container, [createFile('2.png')]);

        expect(preview()).toHaveAttribute('src', 'blob:mock-2');
        expect(revoke).toHaveBeenCalledWith('blob:mock-1');
        expect(revoke).not.toHaveBeenCalledWith('blob:mock-2');
      });

      it('should NOT revoke a non-blob initialUrl when it is replaced', () => {
        const { container } = render(<ImageUploader initialUrl="/old.png" onChange={onChange} />);

        select(container, [createFile()]);

        expect(revoke).not.toHaveBeenCalled();
      });

      it('should pass any file through without validating type or size (see notes)', () => {
        const { container } = render(<ImageUploader onChange={onChange} />);
        const pdf = createFile('doc.pdf', 'application/pdf');

        select(container, [pdf]);

        expect(onChange).toHaveBeenCalledWith(pdf);
      });
    });

    describe('حذف', () => {
      it('should call onChange(undefined) and release the blob when a new file is removed (no initial image)', () => {
        const { container } = render(<ImageUploader onChange={onChange} />);
        select(container, [createFile()]);
        onChange.mockClear();

        fireEvent.click(removeSingleBtn());

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(undefined);
        expect(screen.queryByAltText('پیش‌نمایش تصویر')).not.toBeInTheDocument();
        expect(revoke).toHaveBeenCalledWith('blob:mock-1');
        expect(screen.getByText('آپلود تصویر')).toBeInTheDocument();
      });

      it('should hide a server image and call onChange(null) when it is removed', () => {
        render(<ImageUploader initialUrl="/uploads/a.png" onChange={onChange} />);

        fireEvent.click(removeSingleBtn());

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(null);
        expect(screen.queryByAltText('پیش‌نمایش تصویر')).not.toBeInTheDocument();
        expect(screen.getByText('آپلود تصویر')).toBeInTheDocument();
        expect(revoke).not.toHaveBeenCalled();
      });

      it('should bring the server image back (and report "unchanged") when a NEW file is removed', () => {
        const { container } = render(<ImageUploader initialUrl="/old.png" onChange={onChange} />);
        select(container, [createFile()]);
        onChange.mockClear();

        fireEvent.click(removeSingleBtn());

        expect(onChange).toHaveBeenCalledWith(undefined);
        expect(preview()).toHaveAttribute('src', '/old.png');
      });

      it('should keep reporting null when the server image was removed, a file was picked and then removed', () => {
        const { container } = render(<ImageUploader initialUrl="/old.png" onChange={onChange} />);

        fireEvent.click(removeSingleBtn()); // عکس قدیمی حذف شد
        select(container, [createFile()]); // فایل جدید
        onChange.mockClear();
        fireEvent.click(removeSingleBtn()); // فایل جدید هم برداشته شد

        expect(onChange).toHaveBeenCalledWith(null);
        expect(screen.queryByAltText('پیش‌نمایش تصویر')).not.toBeInTheDocument();
      });

      it('should show a NEW initialUrl even if the previous one was removed', () => {
        const { rerender } = render(<ImageUploader initialUrl="/a.png" onChange={onChange} />);
        fireEvent.click(removeSingleBtn());

        rerender(<ImageUploader initialUrl="/b.png" onChange={onChange} />);

        expect(preview()).toHaveAttribute('src', '/b.png');
      });

      it('should allow selecting a new file after removing', () => {
        const { container } = render(<ImageUploader onChange={onChange} />);
        select(container, [createFile('1.png')]);
        fireEvent.click(removeSingleBtn());

        select(container, [createFile('2.png')]);

        expect(preview()).toHaveAttribute('src', 'blob:mock-2');
      });
    });

    describe('پاک‌سازی', () => {
      it('should release the blob URL on unmount', () => {
        const { container, unmount } = render(<ImageUploader onChange={onChange} />);
        select(container, [createFile()]);
        revoke.mockClear();

        unmount();

        expect(revoke).toHaveBeenCalledWith('blob:mock-1');
      });

      it('should NOT revoke anything on unmount when only initialUrl is shown', () => {
        const { unmount } = render(<ImageUploader initialUrl="/a.png" onChange={onChange} />);

        unmount();

        expect(revoke).not.toHaveBeenCalled();
      });
    });
  });

  // ═════════════════════════════════════════════════════
  // حالت چندتصویری
  // ═════════════════════════════════════════════════════
  describe('multiple mode', () => {
    const renderMulti = (props: Record<string, unknown> = {}) =>
      render(
        <ImageUploader
          multiple
          onChange={onChange}
          onMultipleChange={onMultipleChange}
          onExistingUrlsChange={onExistingUrlsChange}
          {...props}
        />
      );

    describe('رندر اولیه', () => {
      it('should render the "choose" label and no thumbnails by default', () => {
        renderMulti();

        expect(screen.getByText('انتخاب تصاویر')).toBeInTheDocument();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
        expect(labelOf('انتخاب تصاویر')).toHaveClass('bg-blue-600', 'w-44');
      });

      it('should render a multiple, accessible (sr-only) image input', () => {
        const { container } = renderMulti();

        const input = fileInput(container);
        expect(input).toHaveAttribute('multiple');
        expect(input).toHaveAttribute('accept', 'image/*');
        expect(input).toHaveClass('sr-only');
      });

      it('should render the initial thumbnails with Persian alts and the "add" label', () => {
        renderMulti({ initialUrls: ['/a.png', '/b.png'] });

        expect(screen.getByAltText('تصویر 1')).toHaveAttribute('src', '/a.png');
        expect(screen.getByAltText('تصویر 2')).toHaveAttribute('src', '/b.png');
        expect(screen.getByText('افزودن تصاویر')).toBeInTheDocument();
      });

      it('should render one named remove button per thumbnail', () => {
        renderMulti({ initialUrls: ['/a.png', '/b.png', '/c.png'] });

        expect(screen.getAllByRole('button')).toHaveLength(3);
        expect(screen.getByRole('button', { name: 'حذف تصویر 2' })).toHaveAttribute(
          'type',
          'button'
        );
      });

      it('should NOT render the single-mode preview', () => {
        renderMulti({ initialUrl: '/single.png' });

        expect(screen.queryByAltText('پیش‌نمایش تصویر')).not.toBeInTheDocument();
      });

      it('should NOT call any callback on render', () => {
        renderMulti({ initialUrls: ['/a.png'] });

        expect(onMultipleChange).not.toHaveBeenCalled();
        expect(onExistingUrlsChange).not.toHaveBeenCalled();
      });
    });

    describe('همگام‌سازی initialUrls', () => {
      it('should show new initialUrls when their content changes', () => {
        const { rerender } = renderMulti({ initialUrls: ['/a.png'] });

        rerender(
          <ImageUploader
            multiple
            onChange={onChange}
            onMultipleChange={onMultipleChange}
            initialUrls={['/x.png', '/y.png']}
          />
        );

        expect(gallerySrcs()).toEqual(['/x.png', '/y.png']);
      });

      it('should keep newly selected files when initialUrls changes', () => {
        const { container, rerender } = renderMulti({ initialUrls: ['/a.png'] });
        select(container, [createFile()]);

        rerender(<ImageUploader multiple onChange={onChange} initialUrls={['/x.png']} />);

        expect(gallerySrcs()).toEqual(['/x.png', 'blob:mock-1']);
      });

      it('should NOT reset removed items when only the array reference changes', () => {
        const { rerender } = renderMulti({ initialUrls: ['/a.png', '/b.png'] });
        fireEvent.click(screen.getByRole('button', { name: 'حذف تصویر 1' }));

        rerender(<ImageUploader multiple onChange={onChange} initialUrls={['/a.png', '/b.png']} />);

        expect(gallerySrcs()).toEqual(['/b.png']);
      });
    });

    describe('انتخاب فایل', () => {
      it('should preview every selected file and report them', () => {
        const { container } = renderMulti();
        const files = [createFile('1.png'), createFile('2.png')];

        select(container, files);

        expect(create).toHaveBeenCalledTimes(2);
        expect(gallerySrcs()).toEqual(['blob:mock-1', 'blob:mock-2']);
        expect(onMultipleChange).toHaveBeenCalledTimes(1);
        expect(onMultipleChange).toHaveBeenCalledWith(files);
        expect(onExistingUrlsChange).toHaveBeenCalledWith([]);
      });

      it('should NOT call the single-mode onChange', () => {
        const { container } = renderMulti();

        select(container, [createFile()]);

        expect(onChange).not.toHaveBeenCalled();
      });

      it('should append new previews after the initial ones and keep reporting the existing URLs', () => {
        const { container } = renderMulti({ initialUrls: ['/a.png'] });

        select(container, [createFile()]);

        expect(gallerySrcs()).toEqual(['/a.png', 'blob:mock-1']);
        expect(onExistingUrlsChange).toHaveBeenCalledWith(['/a.png']);
      });

      it('should switch the label to "add" after selecting', () => {
        const { container } = renderMulti();

        select(container, [createFile()]);

        expect(screen.getByText('افزودن تصاویر')).toBeInTheDocument();
      });

      it('should report ALL new files after a second batch', () => {
        const { container } = renderMulti();
        const first = createFile('1.png');
        const second = createFile('2.png');

        select(container, [first]);
        select(container, [second]);

        expect(onMultipleChange).toHaveBeenNthCalledWith(1, [first]);
        expect(onMultipleChange).toHaveBeenNthCalledWith(2, [first, second]);
      });

      it('should NOT revoke the first batch when a second batch is added', () => {
        const { container } = renderMulti();
        select(container, [createFile('1.png')]);

        select(container, [createFile('2.png')]);

        expect(gallerySrcs()).toEqual(['blob:mock-1', 'blob:mock-2']);
        expect(revoke).not.toHaveBeenCalled();
      });

      it('should ignore an empty selection', () => {
        const { container } = renderMulti();

        select(container, []);

        expect(onMultipleChange).not.toHaveBeenCalled();
        expect(create).not.toHaveBeenCalled();
      });

      it('should not crash when the callbacks are not provided', () => {
        const { container } = render(<ImageUploader multiple onChange={onChange} />);

        expect(() => select(container, [createFile()])).not.toThrow();
        expect(screen.getByAltText('تصویر 1')).toBeInTheDocument();
      });
    });

    describe('حذف', () => {
      it('should remove only the clicked thumbnail', () => {
        renderMulti({ initialUrls: ['/a.png', '/b.png', '/c.png'] });

        fireEvent.click(screen.getByRole('button', { name: 'حذف تصویر 2' }));

        expect(gallerySrcs()).toEqual(['/a.png', '/c.png']);
      });

      it('should report the remaining existing URLs when an existing image is removed', () => {
        renderMulti({ initialUrls: ['/a.png', '/b.png'] });

        fireEvent.click(screen.getByRole('button', { name: 'حذف تصویر 1' }));

        expect(onExistingUrlsChange).toHaveBeenLastCalledWith(['/b.png']);
        expect(onMultipleChange).toHaveBeenLastCalledWith(undefined);
      });

      it('should NOT revoke a non-blob URL when removing it', () => {
        renderMulti({ initialUrls: ['/a.png'] });

        fireEvent.click(screen.getByRole('button'));

        expect(revoke).not.toHaveBeenCalled();
      });

      it('should revoke ONLY the blob URL of the removed new file and keep the others displayed', () => {
        const { container } = renderMulti();
        select(container, [createFile('1.png'), createFile('2.png')]);

        fireEvent.click(screen.getByRole('button', { name: 'حذف تصویر 1' }));

        expect(revoke).toHaveBeenCalledTimes(1);
        expect(revoke).toHaveBeenCalledWith('blob:mock-1');
        expect(gallerySrcs()).toEqual(['blob:mock-2']);
      });

      it('should tell the parent about the remaining new files after a removal', () => {
        const { container } = renderMulti();
        const first = createFile('1.png');
        const second = createFile('2.png');
        select(container, [first, second]);
        onMultipleChange.mockClear();

        fireEvent.click(screen.getByRole('button', { name: 'حذف تصویر 1' }));

        expect(onMultipleChange).toHaveBeenCalledTimes(1);
        expect(onMultipleChange).toHaveBeenCalledWith([second]);
      });

      it('should report undefined when the last new file is removed', () => {
        const { container } = renderMulti();
        select(container, [createFile()]);
        onMultipleChange.mockClear();

        fireEvent.click(screen.getByRole('button'));

        expect(onMultipleChange).toHaveBeenCalledWith(undefined);
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
      });

      it('should go back to the "choose" label when everything is removed', () => {
        renderMulti({ initialUrls: ['/a.png'] });

        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByText('انتخاب تصاویر')).toBeInTheDocument();
      });

      it('should keep thumbnails correctly mapped after removing one from the middle', () => {
        const { container } = renderMulti({ initialUrls: ['/a.png'] });
        select(container, [createFile('1.png'), createFile('2.png')]);

        fireEvent.click(screen.getByRole('button', { name: 'حذف تصویر 2' }));

        expect(gallerySrcs()).toEqual(['/a.png', 'blob:mock-2']);
      });
    });

    describe('پاک‌سازی', () => {
      it('should release all blob URLs on unmount but never the server URLs', () => {
        const { container, unmount } = renderMulti({ initialUrls: ['/a.png'] });
        select(container, [createFile('1.png'), createFile('2.png')]);
        revoke.mockClear();

        unmount();

        expect(revoke).toHaveBeenCalledWith('blob:mock-1');
        expect(revoke).toHaveBeenCalledWith('blob:mock-2');
        expect(revoke).not.toHaveBeenCalledWith('/a.png');
      });

      it('should NOT release already removed blobs again on unmount', () => {
        const { container, unmount } = renderMulti();
        select(container, [createFile('1.png'), createFile('2.png')]);
        fireEvent.click(screen.getByRole('button', { name: 'حذف تصویر 1' }));
        revoke.mockClear();

        unmount();

        expect(revoke).toHaveBeenCalledTimes(1);
        expect(revoke).toHaveBeenCalledWith('blob:mock-2');
      });
    });
  });
});
