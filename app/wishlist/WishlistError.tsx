// components/wishlist/WishlistError.tsx
'use client';

import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class WishlistError extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
          خطا در دریافت لیست. لطفاً دوباره تلاش کنید.
        </div>
      );
    }

    return this.props.children;
  }
}
