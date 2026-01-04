import { FaqAccordion } from '@/components/sections/faq/faq-accordion';
import { FaqSidebar } from '@/components/sections/faq/faq-sidebar';
import { faqData } from './data';
import { FaqBanner } from '@/components/sections/faq/faq-banner';
import { Breadcrumb } from '@/components/layout/breadcrumb';

export default function FAQPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12 space-y-10">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Banner */}
      <FaqBanner />

      {/* CONTENT */}
      <div className="w-full block">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 items-start w-full">
          {/* Sidebar */}
          <div className="w-full">
            <FaqSidebar categories={faqData} />
          </div>
          {/* Accordion */}
          <div className="w-full space-y-12">
            {faqData.map(category => (
              <section key={category.id} id={category.id}>
                <FaqAccordion category={category} />
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
