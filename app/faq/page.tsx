import { faqData } from './data';

import { FaqBanner } from '@/features/faq/components/faq-banner';
import { FaqSidebar } from '@/features/faq/components/faq-sidebar';
import { FaqAccordion } from '@/features/faq/components/faq-accordion';
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
