'use client';

import { useEffect, useRef, useState } from 'react';
import TabHeader from './TabHeader';
import ProductSpecs from '../specs/ProductSpecs';
import { SpecsGroup } from '@/types/product';

type TabId = 'description' | 'specs' | 'reviews' | 'questions';

type Props = {
  description: string;
  specsArray: SpecsGroup[];
  reviews?: { rating: number; comment: string }[];
  questions?: { user: string; question: string }[];
};

export default function ProductTabs({
  description,
  specsArray,
  reviews = [],
  questions = [],
}: Props) {
  const [active, setActive] = useState<TabId>('description');

  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const specsRef = useRef<HTMLDivElement | null>(null);
  const reviewsRef = useRef<HTMLDivElement | null>(null);
  const questionsRef = useRef<HTMLDivElement | null>(null);

  // اسکرول نرم هنگام کلیک روی تب
  const scrollToSection = (id: TabId) => {
    const el = document.getElementById(id);
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - 90;

    window.scrollTo({
      top,
      behavior: 'smooth',
    });
  };

  // فعال شدن تب‌ها با اسکرول (Scroll Spy)
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
      {
        threshold: [0.3, 0.5, 0.7],
        rootMargin: '-120px 0px 0px 0px',
      }
    );

    sections.forEach(sec => {
      if (sec.ref.current) observer.observe(sec.ref.current);
    });

    return () => observer.disconnect();
  }, [active]);

  return (
    <div className="mt-10 space-y-10">
      {/* تب‌بار چسبان + اسکرول افقی + انیمیشن */}
      <div className="sticky top-0 z-40 bg-white dark:bg-black border-b shadow-sm">
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
        <div
          className="
            prose dark:prose-invert leading-relaxed
        
            prose-headings:text-right prose-p:text-right prose-li:text-right
            prose-img:mx-auto prose-img:rounded-lg prose-img:w-full prose-img:h-auto
          "
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </section>

      {/* مشخصات */}
      <section id="specs" ref={specsRef} dir="rtl" className="scroll-mt-28">
        <ProductSpecs specs={specsArray} />
      </section>

      {/* نظرات */}
      <section id="reviews" ref={reviewsRef} dir="rtl" className="scroll-mt-28 rtl">
        {reviews.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-300">هنوز نظری ثبت نشده است.</div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="text-yellow-500">⭐ {r.rating}</div>
                <p className="text-gray-600 dark:text-gray-300">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* پرسش‌ها */}
      <section id="questions" ref={questionsRef} dir="rtl" className="scroll-mt-28 rtl">
        {questions.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-300">هنوز پرسشی ثبت نشده است.</div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="font-semibold">{q.user}</div>
                <p className="text-gray-600 dark:text-gray-300">{q.question}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
