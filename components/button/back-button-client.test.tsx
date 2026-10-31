// components/button/back-button-client.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// router ثابت، تا بین رندرها آبجکت جدید ساخته نشود
const router = { back: vi.fn(), push: vi.fn(), replace: vi.fn() };

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}));

import { BackButtonClient } from './back-button-client';

describe('BackButtonClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('رندر', () => {
    it('should render a button with the default label', () => {
      render(<BackButtonClient />);

      expect(screen.getByRole('button', { name: 'بازگشت' })).toBeInTheDocument();
    });

    it('should render a custom label', () => {
      render(<BackButtonClient label="برگشت به فهرست" />);

      expect(screen.getByRole('button', { name: 'برگشت به فهرست' })).toBeInTheDocument();
      expect(screen.queryByText('بازگشت')).not.toBeInTheDocument();
    });

    it('should render the arrow icon next to the label', () => {
      render(<BackButtonClient />);

      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toBeInTheDocument();
      // آیکن تزئینی است و نباید در نام دسترس‌پذیر دکمه بیاید
      expect(screen.getByRole('button')).toHaveAccessibleName('بازگشت');
    });

    it('should render an empty label as-is (the default applies only to undefined)', () => {
      render(<BackButtonClient label="" />);

      expect(screen.getByRole('button')).toHaveTextContent('');
    });

    it('should be enabled', () => {
      render(<BackButtonClient />);

      expect(screen.getByRole('button')).toBeEnabled();
    });
  });

  describe('کلیک', () => {
    it('should call router.back() once on click', () => {
      render(<BackButtonClient />);

      fireEvent.click(screen.getByRole('button'));

      expect(router.back).toHaveBeenCalledTimes(1);
    });

    it('should call router.back() with no arguments', () => {
      render(<BackButtonClient />);

      fireEvent.click(screen.getByRole('button'));

      expect(router.back).toHaveBeenCalledWith();
    });

    it('should NOT navigate with push or replace', () => {
      render(<BackButtonClient />);

      fireEvent.click(screen.getByRole('button'));

      expect(router.push).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
    });

    it('should NOT call router.back() before the click', () => {
      render(<BackButtonClient />);

      expect(router.back).not.toHaveBeenCalled();
    });

    it('should call router.back() on every click', () => {
      render(<BackButtonClient />);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      fireEvent.click(button);

      expect(router.back).toHaveBeenCalledTimes(2);
    });

    it('should work when clicking the label text', () => {
      render(<BackButtonClient />);

      fireEvent.click(screen.getByText('بازگشت'));

      expect(router.back).toHaveBeenCalledTimes(1);
    });
  });
});
