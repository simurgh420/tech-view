'use client';

import { ReactNode } from 'react';
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';

type Props = {
  children: ReactNode;
};

export function HorizontalProductScroller({ children }: Props) {
  const { scrollRef } = useHorizontalScroll();

  return (
    <div
      ref={scrollRef}
      className="
        overflow-x-auto
        scrollbar-hide
        overscroll-x-contain
        scroll-smooth
      "
    >
      <div className="flex w-max gap-5 px-1">{children}</div>
    </div>
  );
}
