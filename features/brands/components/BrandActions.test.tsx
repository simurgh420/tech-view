// features/brands/components/BrandActions.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

const router = { push: vi.fn(), replace: vi.fn(), back: vi.fn() };

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}));

vi.mock('@/features/brands/hooks/useBrands', () => ({
  useDeleteBrand: vi.fn(),
}));

// نسخه ساده: پراپ‌ها را نمایش می‌دهد و تایید را با یک دکمه شبیه‌سازی می‌کند
vi.mock('@/components/ui/confirm-dialog', () => ({
  ConfirmDialog: (props: any) => (
    <div data-testid="confirm-dialog">
      {props.trigger}
      <h2 data-testid="dialog-title">{props.title}</h2>
      <p data-testid="dialog-description">{props.description}</p>
      <button type="button" data-testid="dialog-cancel">
        {props.cancelText}
      </button>
      <button type="button" data-testid="dialog-confirm" onClick={props.onConfirm}>
        {props.confirmText}
      </button>
    </div>
  ),
}));

import { useDeleteBrand } from '@/features/brands/hooks/useBrands';
import { BrandActions } from './BrandActions';

const mutate = vi.fn();

const confirm = () => fireEvent.click(screen.getByTestId('dialog-confirm'));

describe('BrandActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteBrand).mockReturnValue({ mutate } as any);
  });

  describe('رندر', () => {
    it('should render the delete trigger button', () => {
      render(<BrandActions slug="apple" />);

      expect(screen.getByRole('button', { name: /حذف برند/ })).toBeInTheDocument();
    });

    it('should pass the confirmation texts to the dialog', () => {
      render(<BrandActions slug="apple" />);

      expect(screen.getByTestId('dialog-title')).toHaveTextContent('حذف برند');
      expect(screen.getByTestId('dialog-description')).toHaveTextContent(
        'آیا مطمئن هستید که می‌خواهید این برند را حذف کنید؟ این عملیات قابل بازگشت نیست.'
      );
      expect(screen.getByTestId('dialog-confirm')).toHaveTextContent('بله، حذف کن');
      expect(screen.getByTestId('dialog-cancel')).toHaveTextContent('لغو');
    });
  });

  describe('قبل از تایید', () => {
    it('should NOT delete anything on render', () => {
      render(<BrandActions slug="apple" />);

      expect(mutate).not.toHaveBeenCalled();
    });

    it('should NOT delete when only the trigger button is clicked', () => {
      render(<BrandActions slug="apple" />);

      fireEvent.click(screen.getByRole('button', { name: /حذف برند/ }));

      expect(mutate).not.toHaveBeenCalled();
    });

    it('should NOT delete or navigate when the dialog is canceled', () => {
      render(<BrandActions slug="apple" />);

      fireEvent.click(screen.getByTestId('dialog-cancel'));

      expect(mutate).not.toHaveBeenCalled();
      expect(router.push).not.toHaveBeenCalled();
    });
  });

  describe('تایید حذف', () => {
    it('should delete the brand by its slug on confirm', () => {
      render(<BrandActions slug="apple" />);

      confirm();

      expect(mutate).toHaveBeenCalledTimes(1);
      expect(mutate.mock.calls[0][0]).toBe('apple');
    });

    it('should use the slug prop it was given', () => {
      render(<BrandActions slug="سامسونگ" />);

      confirm();

      expect(mutate.mock.calls[0][0]).toBe('سامسونگ');
    });

    it('should NOT navigate before the mutation succeeds', () => {
      render(<BrandActions slug="apple" />);

      confirm();

      expect(router.push).not.toHaveBeenCalled();
    });

    it('should navigate to /brands after a successful delete (see notes)', () => {
      render(<BrandActions slug="apple" />);

      confirm();
      mutate.mock.calls[0][1].onSuccess();

      expect(router.push).toHaveBeenCalledTimes(1);
      expect(router.push).toHaveBeenCalledWith('/brands');
    });

    it('should register ONLY an onSuccess callback (errors are not handled, see notes)', () => {
      render(<BrandActions slug="apple" />);

      confirm();

      expect(Object.keys(mutate.mock.calls[0][1])).toEqual(['onSuccess']);
    });

    it('should delete again on every confirm (no guard against double submit, see notes)', () => {
      render(<BrandActions slug="apple" />);

      confirm();
      confirm();

      expect(mutate).toHaveBeenCalledTimes(2);
    });
  });
});
