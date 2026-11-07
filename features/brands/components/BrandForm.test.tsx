// features/brands/components/BrandForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: ({ fill, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

vi.mock('./BrandActions', () => ({
  BrandActions: ({ slug }: { slug: string }) => (
    <div data-testid="brand-actions" data-slug={slug} />
  ),
}));

import { BrandForm } from './BrandForm';

const onSubmit = vi.fn();

const LOGO = 'https://example.com/logo.png';

function renderForm(props: Record<string, unknown> = {}) {
  return render(
    <BrandForm mode="create" onSubmit={onSubmit} isLoading={false} {...(props as any)} />
  );
}

const nameInput = () => screen.getByLabelText('نام برند') as HTMLInputElement;
const logoInput = () => screen.getByLabelText('لوگو (اختیاری)') as HTMLInputElement;
const checkbox = () => screen.getByRole('checkbox') as HTMLInputElement;

const type = (el: HTMLElement, value: string) => fireEvent.change(el, { target: { value } });
const submit = (name = 'ثبت') => fireEvent.click(screen.getByRole('button', { name }));
const submitted = () => onSubmit.mock.calls[0][0];

describe('BrandForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═════════════════════════════════════════════════════
  // رندر
  // ═════════════════════════════════════════════════════
  describe('رندر', () => {
    it('should render the create title and submit label in create mode', () => {
      renderForm({ mode: 'create' });

      expect(screen.getByText('ایجاد برند جدید')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ثبت' })).toBeInTheDocument();
    });

    it('should render the edit title and submit label in edit mode', () => {
      renderForm({ mode: 'edit', initialValues: { name: 'Apple' } });

      expect(screen.getByText('ویرایش برند')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ویرایش' })).toBeInTheDocument();
    });

    it('should render the name, logo and active fields', () => {
      renderForm();

      expect(nameInput()).toBeInTheDocument();
      expect(logoInput()).toBeInTheDocument();
      expect(checkbox()).toBeInTheDocument();
      expect(screen.getByText('فعال')).toBeInTheDocument();
    });

    it('should render the placeholders', () => {
      renderForm();

      expect(nameInput()).toHaveAttribute('placeholder', 'مثلاً: Samsung');
      expect(logoInput()).toHaveAttribute('placeholder', 'https://brandfetch.com/');
    });
  });

  // ═════════════════════════════════════════════════════
  // مقادیر اولیه
  // ═════════════════════════════════════════════════════
  describe('مقادیر اولیه', () => {
    it('should start empty and active in create mode', () => {
      renderForm({ mode: 'create' });

      expect(nameInput().value).toBe('');
      expect(logoInput().value).toBe('');
      expect(checkbox()).toBeChecked();
    });

    it('should fill the fields from initialValues in edit mode', () => {
      renderForm({
        mode: 'edit',
        initialValues: { name: 'Apple', logo: LOGO, isActive: false },
      });

      expect(nameInput().value).toBe('Apple');
      expect(logoInput().value).toBe(LOGO);
      expect(checkbox()).not.toBeChecked();
    });

    it('should respect initialValues.isActive = true in edit mode', () => {
      renderForm({ mode: 'edit', initialValues: { name: 'Apple', isActive: true } });

      expect(checkbox()).toBeChecked();
    });

    it('should respect initialValues.isActive = false even in create mode', () => {
      renderForm({ mode: 'create', initialValues: { name: 'x', isActive: false } });

      expect(checkbox()).not.toBeChecked();
    });

    it('should treat a null logo as an empty string', () => {
      renderForm({ mode: 'edit', initialValues: { name: 'Apple', logo: null } });

      expect(logoInput().value).toBe('');
      expect(screen.queryByAltText('لوگوی برند')).not.toBeInTheDocument();
    });
  });

  // ═════════════════════════════════════════════════════
  // پیش‌نمایش لوگو
  // ═════════════════════════════════════════════════════
  describe('پیش‌نمایش لوگو', () => {
    it('should NOT render a preview when the logo is empty', () => {
      renderForm();

      expect(screen.queryByAltText('لوگوی برند')).not.toBeInTheDocument();
    });

    it('should render a preview of the initial logo', () => {
      renderForm({ mode: 'edit', initialValues: { name: 'Apple', logo: LOGO } });

      const img = screen.getByAltText('لوگوی برند');
      expect(img).toHaveAttribute('src', LOGO);
      expect(img).toHaveAttribute('width', '120');
      expect(img).toHaveAttribute('height', '120');
    });

    it('should show the preview after typing a logo URL', () => {
      renderForm();

      type(logoInput(), LOGO);

      expect(screen.getByAltText('لوگوی برند')).toHaveAttribute('src', LOGO);
    });

    it('should remove the preview when the logo is cleared', () => {
      renderForm({ mode: 'edit', initialValues: { name: 'Apple', logo: LOGO } });

      type(logoInput(), '');

      expect(screen.queryByAltText('لوگوی برند')).not.toBeInTheDocument();
    });
  });

  // ═════════════════════════════════════════════════════
  // slug و BrandActions
  // ═════════════════════════════════════════════════════
  describe('دکمه حذف (BrandActions)', () => {
    it('should render BrandActions with the slug when slug is provided', () => {
      renderForm({ mode: 'edit', slug: 'apple', initialValues: { name: 'Apple' } });

      expect(screen.getByTestId('brand-actions')).toHaveAttribute('data-slug', 'apple');
    });

    it('should NOT render BrandActions without a slug', () => {
      renderForm({ mode: 'create' });

      expect(screen.queryByTestId('brand-actions')).not.toBeInTheDocument();
    });

    it('should NOT render BrandActions for an empty slug', () => {
      renderForm({ mode: 'edit', slug: '', initialValues: { name: 'Apple' } });

      expect(screen.queryByTestId('brand-actions')).not.toBeInTheDocument();
    });
  });

  // ═════════════════════════════════════════════════════
  // حالت loading
  // ═════════════════════════════════════════════════════
  describe('isLoading', () => {
    it('should disable the submit button and show the saving label', () => {
      renderForm({ isLoading: true });

      const btn = screen.getByRole('button', { name: 'در حال ذخیره...' });
      expect(btn).toBeDisabled();
      expect(screen.queryByRole('button', { name: 'ثبت' })).not.toBeInTheDocument();
    });

    it('should show the same saving label in edit mode', () => {
      renderForm({ mode: 'edit', isLoading: true, initialValues: { name: 'Apple' } });

      expect(screen.getByRole('button', { name: 'در حال ذخیره...' })).toBeDisabled();
    });

    it('should enable the submit button when not loading', () => {
      renderForm({ isLoading: false });

      expect(screen.getByRole('button', { name: 'ثبت' })).toBeEnabled();
    });

    it('should NOT submit while loading', async () => {
      renderForm({ isLoading: true });
      type(nameInput(), 'Apple');

      fireEvent.click(screen.getByRole('button', { name: 'در حال ذخیره...' }));
      await new Promise(r => setTimeout(r, 20));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // ═════════════════════════════════════════════════════
  // اعتبارسنجی
  // ═════════════════════════════════════════════════════
  describe('اعتبارسنجی', () => {
    it('should NOT submit when the name is empty (create)', async () => {
      renderForm();

      submit();

      await waitFor(() => expect(nameInput()).toHaveAttribute('aria-invalid', 'true'));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should NOT submit when the name is cleared (edit)', async () => {
      renderForm({ mode: 'edit', initialValues: { name: 'Apple', isActive: true } });
      type(nameInput(), '');

      submit('ویرایش');

      await waitFor(() => expect(nameInput()).toHaveAttribute('aria-invalid', 'true'));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should show a validation message under the name field', async () => {
      const { container } = renderForm();

      submit();

      await waitFor(() => {
        const messages = container.querySelectorAll('[id$="-form-item-message"]');
        expect(messages.length).toBeGreaterThan(0);
        expect(messages[0].textContent).not.toBe('');
      });
    });

    it('should accept the form once the name becomes valid', async () => {
      renderForm();
      submit();
      await waitFor(() => expect(nameInput()).toHaveAttribute('aria-invalid', 'true'));

      type(nameInput(), 'Apple');
      submit();

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    });
  });

  // ═════════════════════════════════════════════════════
  // ثبت در حالت create
  // ═════════════════════════════════════════════════════
  describe('ثبت (create)', () => {
    it('should submit the name and isActive = true by default', async () => {
      renderForm();
      type(nameInput(), 'Samsung');

      submit();

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(submitted()).toMatchObject({ name: 'Samsung', isActive: true });
    });

    it('should submit the logo when provided', async () => {
      renderForm();
      type(nameInput(), 'Samsung');
      type(logoInput(), LOGO);

      submit();

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(submitted()).toMatchObject({ name: 'Samsung', logo: LOGO });
    });

    it('should submit isActive = false after unchecking the checkbox', async () => {
      renderForm();
      type(nameInput(), 'Samsung');

      fireEvent.click(checkbox());
      submit();

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(submitted().isActive).toBe(false);
    });

    it('should toggle the checkbox visually', () => {
      renderForm();

      fireEvent.click(checkbox());
      expect(checkbox()).not.toBeChecked();

      fireEvent.click(checkbox());
      expect(checkbox()).toBeChecked();
    });

    it('should call onSubmit exactly once per submit', async () => {
      renderForm();
      type(nameInput(), 'Samsung');

      submit();

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      await new Promise(r => setTimeout(r, 20));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('should NOT put unknown fields in the payload', async () => {
      renderForm();
      type(nameInput(), 'Samsung');

      submit();

      await waitFor(() => expect(onSubmit).toHaveBeenCalled());
      expect(Object.keys(submitted()).sort()).toEqual(expect.arrayContaining(['isActive', 'name']));
      expect(submitted()).not.toHaveProperty('slug');
    });
  });

  // ═════════════════════════════════════════════════════
  // ثبت در حالت edit
  // ═════════════════════════════════════════════════════
  describe('ثبت (edit)', () => {
    const initial = { name: 'Apple', logo: LOGO, isActive: true };

    it('should submit the current values', async () => {
      renderForm({ mode: 'edit', initialValues: initial });

      submit('ویرایش');

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(submitted()).toMatchObject({ name: 'Apple', logo: LOGO, isActive: true });
    });

    it('should submit the edited name', async () => {
      renderForm({ mode: 'edit', initialValues: initial });
      type(nameInput(), 'Apple Inc');

      submit('ویرایش');

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(submitted().name).toBe('Apple Inc');
    });

    it('should convert an empty logo to undefined', async () => {
      renderForm({ mode: 'edit', initialValues: { name: 'Apple', logo: '', isActive: true } });

      submit('ویرایش');

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(submitted().logo).toBeUndefined();
    });

    it('should send logo = undefined when the user clears an existing logo (cannot remove it, see notes)', async () => {
      renderForm({ mode: 'edit', initialValues: initial });
      type(logoInput(), '');

      submit('ویرایش');

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(submitted().logo).toBeUndefined();
    });

    it('should keep a non-empty logo as it is', async () => {
      renderForm({ mode: 'edit', initialValues: initial });
      type(logoInput(), 'https://example.com/new.png');

      submit('ویرایش');

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(submitted().logo).toBe('https://example.com/new.png');
    });

    it('should submit isActive = false after unchecking', async () => {
      renderForm({ mode: 'edit', initialValues: initial });

      fireEvent.click(checkbox());
      submit('ویرایش');

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(submitted().isActive).toBe(false);
    });
  });
});
