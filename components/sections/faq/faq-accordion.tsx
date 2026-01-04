'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { FAQCategory } from '@/types/faq';

export function FaqAccordion({ category }: { category: FAQCategory }) {
  return (
    <Accordion type="single" collapsible>
      {category.items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="border-b first:pt-0 pt-4">
          <AccordionTrigger className="text-left text-base font-medium text-gray-900">
            {item.question}
          </AccordionTrigger>

          <AccordionContent className="text-sm text-gray-600 leading-relaxed">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
