// components/shared/Reveal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number; // میلی‌ثانیه، برای افکت پلکانی بین بخش‌ها
};

export function Reveal({ children, className = '', delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el); // فقط یک‌بار انیمیشن اجرا بشه
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`
        transition-all duration-700 ease-out
        motion-reduce:transition-none motion-reduce:transform-none
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
