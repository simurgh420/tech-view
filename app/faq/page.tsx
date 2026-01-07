import { faqData } from './data';

import { FaqBanner } from '@/components/sections/faq/faq-banner';
import { FaqSidebar } from '@/components/sections/faq/faq-sidebar';
import { FaqAccordion } from '@/components/sections/faq/faq-accordion';
import { Breadcrumb } from '@/components/layout/breadcrumb';

export default function FAQPage() {
  return (
    <main className="container mx-auto max-w-7xl px-6 py-12 space-y-8 ">
      {/* Breadcrumb */}

      <Breadcrumb />

      {/* Banner */}
      <FaqBanner />

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-12 items-start [direction:rtl]">
        {/* Sidebar */}
        <FaqSidebar categories={faqData} />

        {/* FAQ Content */}
        <div className="[direction:ltr]">
          {faqData.map(category => (
            <section key={category.id} id={category.id} className="mb-10 scroll-mt-50">
              <FaqAccordion category={category} />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
