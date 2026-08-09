import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { FAQCategory } from '@/types/faq';

export function FaqAccordion({ category }: { category: FAQCategory }) {
  return (
    <Accordion type="single" collapsible className="w-full text-right">
      {category.items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="border-b border-border py-3">
          {/* قبلاً flex-row-reverse داشت؛ خودِ AccordionTrigger شادکن با
              justify-between ساده طراحی شده که خودکار با dir سند می‌چرخد —
              اضافه‌کردن flex-row-reverse دوباره برعکسش می‌کرد و جای شورون
              را اشتباه می‌برد */}
          <AccordionTrigger
            className="
              text-base
              font-medium
              text-foreground
              hover:text-primary
              hover:no-underline
            "
          >
            {item.question}
          </AccordionTrigger>

          <AccordionContent className="animate-in fade-in slide-in-from-top-1 ps-2 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
