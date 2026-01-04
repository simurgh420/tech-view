import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BlogForm } from '@/components/sections/blog/BlogForm';
import userEvent from '@testing-library/user-event';

describe('BlogForm Component', () => {
  it('renders all fields correctly', () => {
    render(<BlogForm onSubmit={vi.fn()} />);

    expect(screen.getByPlaceholderText(/تجربه من با هدفون‌های استریو/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/یک توضیح کوتاه درباره بلاگ/i)).toBeInTheDocument();
    expect(screen.getByText(/ثبت بلاگ/i)).toBeInTheDocument();
  });

  it('shows validation error when title is too short', async () => {
    render(<BlogForm onSubmit={vi.fn()} />);
    const titleInput = screen.getByPlaceholderText(/تجربه من با هدفون‌های استریو/i);

    await userEvent.type(titleInput, 'ab');
    fireEvent.submit(screen.getByRole('button', { name: /ثبت بلاگ/i }));

    expect(await screen.findByText(/عنوان باید حداقل ۳ کاراکتر باشد/i)).toBeInTheDocument();
  });

  it('calls onSubmit with valid initialValues', async () => {
    const handleSubmit = vi.fn();

    const initialValues = {
      title: 'تجربه من',
      excerpt: 'این یک خلاصه تستی است',
      coverImageUrl: null,
      content: 'این یک محتوای طولانی تستی است',
      tags: ['تست'],
    };

    render(<BlogForm onSubmit={handleSubmit} initialValues={initialValues} />);

    fireEvent.submit(screen.getByTestId('blog-form'));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());

    expect(handleSubmit.mock.calls[0][0]).toMatchObject({
      title: initialValues.title,
      excerpt: initialValues.excerpt,
      content: initialValues.content,
      tags: initialValues.tags,
    });
  });

  it('shows loading state on button', () => {
    render(<BlogForm onSubmit={vi.fn()} isLoading />);

    const button = screen.getByRole('button', { name: 'در حال ذخیره...' });

    expect(button).toBeDisabled();
  });
});
