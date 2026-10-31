// features/products/components/ProductCard.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

import ProductCard from './ProductCard';
import { useAddToCart } from '@/features/cart/hooks/useCart';
import { useNotify } from '@/hooks/useNotify';
import type { Product } from '@/features/products/types/product';

// ─── mockها ───────────────────────────────────────────────

vi.mock('next/image', () => ({
  default: ({ fill, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} data-fill={fill ? 'true' : undefined} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/features/cart/hooks/useCart', () => ({
  useAddToCart: vi.fn(),
}));

vi.mock('@/hooks/useNotify', () => ({
  useNotify: vi.fn(),
}));

vi.mock('@/features/wishlist/components/WishlistButton', () => ({
  WishlistButton: ({ productId }: { productId: string }) => (
    <button type="button" data-testid="wishlist-button" data-product-id={productId} />
  ),
}));

vi.mock('@/components/ui/star-rating-input', () => ({
  StarRatingDisplay: ({ value, size }: { value: number; size: number }) => (
    <div data-testid="stars" data-value={value} data-size={size} />
  ),
}));

// خروجی قابل‌پیش‌بینی، تا تست به فرمت واقعی قیمت وابسته نباشد
vi.mock('@/lib/formatPrice', () => ({
  formatPrice: (n: number) => `fmt(${n})`,
}));

// ─── ابزارهای کمکی ───────────────────────────────────────

const createProduct = (overrides: Record<string, unknown> = {}): Product =>
  ({
    id: 'p1',
    slug: 'iphone-15',
    title: 'آیفون ۱۵',
    thumbnail: '/img/iphone.png',
    price: 50_000_000,
    isDiscounted: false,
    discountPrice: null,
    discountPercentage: null,
    rating: 0,
    ...overrides,
  }) as unknown as Product;

const mutate = vi.fn();
const notifyError = vi.fn();

function setupHooks(isPending = false) {
  vi.mocked(useAddToCart).mockReturnValue({ mutate, isPending } as any);
  vi.mocked(useNotify).mockReturnValue({ error: notifyError } as any);
}

// ─── stub برای ResizeObserver و اندازه‌ی المان‌ها ───────────

let observers: MockResizeObserver[] = [];

class MockResizeObserver {
  callback: () => void;
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  constructor(cb: () => void) {
    this.callback = cb;
    observers.push(this);
  }
}

const sizes = { textWidth: 0, containerWidth: 0 };

function stubLayout() {
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get() {
      return this.tagName === 'SPAN' ? sizes.textWidth : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return this.tagName === 'H2' ? sizes.containerWidth : 0;
    },
  });
}

function unstubLayout() {
  // @ts-expect-error حذف override و برگشت به getter اصلی jsdom
  delete HTMLElement.prototype.scrollWidth;
  // @ts-expect-error حذف override و برگشت به getter اصلی jsdom
  delete HTMLElement.prototype.clientWidth;
}

const getTitleSpan = () => screen.getByRole('heading', { level: 2 }).querySelector('span')!;

// ─── تست‌ها ───────────────────────────────────────────────

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    observers = [];
    sizes.textWidth = 0;
    sizes.containerWidth = 0;
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    stubLayout();
    setupHooks();
  });

  afterEach(() => {
    unstubLayout();
    vi.unstubAllGlobals();
  });

  describe('محتوای اصلی', () => {
    it('should link to the product page by slug', () => {
      render(<ProductCard product={createProduct({ slug: 'galaxy-s25' })} />);

      expect(screen.getByRole('link')).toHaveAttribute('href', '/products/galaxy-s25');
    });

    it('should render the title in an h2', () => {
      render(<ProductCard product={createProduct({ title: 'گوشی تستی' })} />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('گوشی تستی');
    });

    it('should render the fast shipping label (default and custom)', () => {
      const { unmount } = render(<ProductCard product={createProduct()} />);
      expect(screen.getByText('ارسال سریع')).toBeInTheDocument();
      unmount();

      render(<ProductCard product={createProduct()} fastShippingLabel="Fast" />);
      expect(screen.getByText('Fast')).toBeInTheDocument();
    });

    it('should render the wishlist button with the product id', () => {
      render(<ProductCard product={createProduct({ id: 'p42' })} />);

      expect(screen.getByTestId('wishlist-button')).toHaveAttribute('data-product-id', 'p42');
    });
  });

  describe('تصویر', () => {
    it('should render the thumbnail with title as alt', () => {
      render(<ProductCard product={createProduct({ thumbnail: '/a.png', title: 'محصول' })} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/a.png');
      expect(img).toHaveAttribute('alt', 'محصول');
    });

    it.each([null, undefined, ''])(
      'should fall back to placeholder when thumbnail is %j',
      thumb => {
        render(<ProductCard product={createProduct({ thumbnail: thumb })} />);

        expect(screen.getByRole('img')).toHaveAttribute('src', '/placeholder.jpg');
      }
    );
  });

  describe('قیمت', () => {
    it('should show only the regular price when not discounted', () => {
      render(<ProductCard product={createProduct({ price: 1000 })} />);

      expect(screen.getByText('fmt(1000)')).toBeInTheDocument();
      expect(screen.queryByText(/^%/)).not.toBeInTheDocument();
    });

    it('should show discount price and the struck-through original price', () => {
      render(
        <ProductCard
          product={createProduct({
            price: 1000,
            isDiscounted: true,
            discountPrice: 800,
            discountPercentage: 20,
          })}
        />
      );

      expect(screen.getByText('fmt(800)')).toBeInTheDocument();
      expect(screen.getByText('fmt(1000)')).toHaveClass('line-through');
    });

    it('should fall back to price when discountPrice is null', () => {
      render(
        <ProductCard
          product={createProduct({
            price: 1000,
            isDiscounted: true,
            discountPrice: null,
            discountPercentage: 10,
          })}
        />
      );

      // هم قیمت جدید و هم قیمت خط‌خورده برابر price هستند
      expect(screen.getAllByText('fmt(1000)')).toHaveLength(2);
    });
  });

  describe('نشان تخفیف', () => {
    it('should render the discount badge when discounted', () => {
      render(
        <ProductCard
          product={createProduct({
            isDiscounted: true,
            discountPrice: 800,
            price: 1000,
            discountPercentage: 20,
          })}
        />
      );

      expect(screen.getByText('%fmt(20)')).toBeInTheDocument();
    });

    it('should NOT render the badge when not discounted', () => {
      render(<ProductCard product={createProduct({ discountPercentage: 20 })} />);

      expect(screen.queryByText('%fmt(20)')).not.toBeInTheDocument();
    });

    it('should NOT render the badge when discountPercentage is null', () => {
      render(
        <ProductCard
          product={createProduct({
            isDiscounted: true,
            discountPrice: 800,
            discountPercentage: null,
          })}
        />
      );

      expect(screen.queryByText(/^%/)).not.toBeInTheDocument();
    });
  });

  describe('امتیاز', () => {
    it('should render stars when rating > 0', () => {
      render(<ProductCard product={createProduct({ rating: 4.5 })} />);

      const stars = screen.getByTestId('stars');
      expect(stars).toHaveAttribute('data-value', '4.5');
      expect(stars).toHaveAttribute('data-size', '9');
    });

    it('should convert a string rating to number', () => {
      render(<ProductCard product={createProduct({ rating: '3.5' })} />);

      expect(screen.getByTestId('stars')).toHaveAttribute('data-value', '3.5');
    });

    it.each([0, null, undefined, 'abc'])('should NOT render stars when rating is %j', rating => {
      render(<ProductCard product={createProduct({ rating })} />);

      expect(screen.queryByTestId('stars')).not.toBeInTheDocument();
    });
  });

  describe('دکمه افزودن به سبد', () => {
    it('should render default label and be enabled', () => {
      render(<ProductCard product={createProduct()} />);

      const btn = screen.getByRole('button', { name: 'افزودن به سبد' });
      expect(btn).toBeEnabled();
    });

    it('should render custom labels', () => {
      setupHooks(true);
      render(<ProductCard product={createProduct()} addingLabel="Adding..." />);

      expect(screen.getByRole('button', { name: 'Adding...' })).toBeInTheDocument();
    });

    it('should call mutate with productId and quantity 1', () => {
      render(<ProductCard product={createProduct({ id: 'p7' })} />);

      fireEvent.click(screen.getByRole('button', { name: 'افزودن به سبد' }));

      expect(mutate).toHaveBeenCalledTimes(1);
      expect(mutate.mock.calls[0][0]).toEqual({ productId: 'p7', quantity: 1 });
    });

    it('should prevent navigation and stop propagation on click', () => {
      const parentClick = vi.fn();
      render(
        <div onClick={parentClick}>
          <ProductCard product={createProduct()} />
        </div>
      );

      // fireEvent.click مقدار false برمی‌گرداند اگر preventDefault صدا زده شده باشد
      const notPrevented = fireEvent.click(screen.getByRole('button', { name: 'افزودن به سبد' }));

      expect(notPrevented).toBe(false);
      expect(parentClick).not.toHaveBeenCalled();
    });

    it('should show error notification when mutation fails', () => {
      render(<ProductCard product={createProduct()} />);

      fireEvent.click(screen.getByRole('button', { name: 'افزودن به سبد' }));
      const options = mutate.mock.calls[0][1];
      options.onError();

      expect(notifyError).toHaveBeenCalledWith('خطا در افزودن به سبد');
    });

    it('should be disabled and show adding label while pending', () => {
      setupHooks(true);
      render(<ProductCard product={createProduct()} />);

      const btn = screen.getByRole('button', { name: 'در حال افزودن...' });
      expect(btn).toBeDisabled();
      expect(screen.queryByText('افزودن به سبد')).not.toBeInTheDocument();
    });
  });

  describe('marquee عنوان', () => {
    it('should NOT animate when the title fits', () => {
      sizes.textWidth = 100;
      sizes.containerWidth = 200;

      render(<ProductCard product={createProduct()} />);

      const span = getTitleSpan();
      expect(span.className).not.toContain('animate-');
      expect(span.style.getPropertyValue('--marquee-distance')).toBe('');
    });

    it('should NOT animate when the title exactly fits', () => {
      sizes.textWidth = 200;
      sizes.containerWidth = 200;

      render(<ProductCard product={createProduct()} />);

      expect(getTitleSpan().className).not.toContain('animate-');
    });

    it('should animate with the correct distance when the title overflows', () => {
      sizes.textWidth = 320;
      sizes.containerWidth = 200;

      render(<ProductCard product={createProduct()} />);

      const span = getTitleSpan();
      expect(span.className).toContain('group-hover:animate-[marquee_3.5s_linear_infinite]');
      expect(span.style.getPropertyValue('--marquee-distance')).toBe('-120px');
    });

    it('should observe the title container with ResizeObserver', () => {
      render(<ProductCard product={createProduct()} />);

      expect(observers).toHaveLength(1);
      expect(observers[0].observe).toHaveBeenCalledWith(screen.getByRole('heading', { level: 2 }));
    });

    it('should re-measure when the container is resized', () => {
      sizes.textWidth = 300;
      sizes.containerWidth = 400;
      render(<ProductCard product={createProduct()} />);
      expect(getTitleSpan().className).not.toContain('animate-');

      sizes.containerWidth = 250;
      act(() => observers[0].callback());

      expect(getTitleSpan().className).toContain('animate-');
      expect(getTitleSpan().style.getPropertyValue('--marquee-distance')).toBe('-50px');
    });

    it('should re-measure when the title changes', () => {
      sizes.textWidth = 100;
      sizes.containerWidth = 200;
      const { rerender } = render(<ProductCard product={createProduct({ title: 'کوتاه' })} />);
      expect(getTitleSpan().className).not.toContain('animate-');

      sizes.textWidth = 500;
      rerender(<ProductCard product={createProduct({ title: 'یک عنوان خیلی خیلی طولانی' })} />);

      expect(getTitleSpan().className).toContain('animate-');
    });

    it('should disconnect the observer on unmount', () => {
      const { unmount } = render(<ProductCard product={createProduct()} />);
      const observer = observers[0];

      unmount();

      expect(observer.disconnect).toHaveBeenCalled();
    });
  });
});
