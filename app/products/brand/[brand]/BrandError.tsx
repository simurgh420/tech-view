// app/product/brand/[brand]/BrandError.tsx
'use client';

import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class BrandError extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <p className="p-10 text-center text-gray-600">برند یافت نشد ❌</p>;
    }

    return this.props.children;
  }
}
