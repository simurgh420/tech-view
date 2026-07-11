// components/sections/products/tabs/ProductTabs.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import TabHeader from './TabHeader';
import ProductSpecs from '../specs/ProductSpecs';
import { SpecsGroup } from '@/types/product';
import { ReviewsSection } from '@/components/sections/reviews/ReviewsSection';
import { ProductCommentsSection } from '@/components/sections/product-comments/ProductCommentsSection';
import RichContentViewer from '@/components/shared/RichContentViewer';

type TabId = 'description' | 'specs' | 'reviews' | 'questions';

type Props = {
  productSlug: string;
  description: string;
  specsArray: SpecsGroup[];
};

export default function ProductTabs({ productSlug, description, specsArray }: Props) {
  const [active, setActive] = useState<TabId>('description');

  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const specsRef = useRef<HTMLDivElement | null>(null);
  const reviewsRef = useRef<HTMLDivElement | null>(null);
  const questionsRef = useRef<HTMLDivElement | null>(null);

  const scrollToSection = (id: TabId) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  useEffect(() => {
    const sections: { id: TabId; ref: React.RefObject<HTMLDivElement | null> }[] = [
      { id: 'description', ref: descriptionRef },
      { id: 'specs', ref: specsRef },
      { id: 'reviews', ref: reviewsRef },
      { id: 'questions', ref: questionsRef },
    ];

    const observer = new IntersectionObserver(
      entries => {
        let best: { id: TabId; ratio: number } | null = null;
        for (const entry of entries) {
          const id = entry.target.id as TabId;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { id, ratio: entry.intersectionRatio };
          }
        }
        if (best && best.ratio > 0.3 && best.id !== active) {
          setActive(best.id);
        }
      },
      { threshold: [0.3, 0.5, 0.7], rootMargin: '-120px 0px 0px 0px' }
    );

    sections.forEach(sec => {
      if (sec.ref.current) observer.observe(sec.ref.current);
    });

    return () => observer.disconnect();
  }, [active]);

  return (
    <div className="mt-10 space-y-10">
      <div className="sticky top-0 z-40 border-b bg-white shadow-sm dark:bg-black">
        <TabHeader
          active={active}
          onChange={(tab: TabId) => {
            setActive(tab);
            scrollToSection(tab);
          }}
        />
      </div>

      {/* توضیحات */}
      <section id="description" ref={descriptionRef} dir="rtl" className="scroll-mt-28">
        <RichContentViewer html={description} />
      </section>

      {/* مشخصات */}
      <section id="specs" ref={specsRef} dir="rtl" className="scroll-mt-28">
        <ProductSpecs specs={specsArray} />
      </section>

      {/* نظرات (ریویو) */}
      <section id="reviews" ref={reviewsRef} dir="rtl" className="scroll-mt-28">
        <ReviewsSection productSlug={productSlug} />
      </section>

      {/* پرسش و پاسخ (کامنت) */}
      <section id="questions" ref={questionsRef} dir="rtl" className="scroll-mt-28">
        <ProductCommentsSection productSlug={productSlug} />
      </section>
    </div>
  );
}
