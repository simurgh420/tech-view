import { faqData } from './data';

import { FaqBanner } from '@/components/sections/faq/faq-banner';
import { FaqSidebar } from '@/components/sections/faq/faq-sidebar';
import { FaqAccordion } from '@/components/sections/faq/faq-accordion';
import { Breadcrumb } from '@/components/layout/breadcrumb';

export default function FAQPage() {
  return (
    <main dir="rtl" className="container mx-auto max-w-7xl space-y-8 px-6 py-12">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Banner */}
      <FaqBanner />

      {/* Content */}
      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <FaqSidebar categories={faqData} />

        {/* FAQ Content — قبلاً اینجا [direction:ltr] بود که کل محتوای
            فارسی رو زوری چپ‌به‌راست می‌کرد؛ حذف شد */}
        <div>
          {faqData.map(category => (
            <section key={category.id} id={category.id} className="mb-10 scroll-mt-28">
              <FaqAccordion category={category} />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
