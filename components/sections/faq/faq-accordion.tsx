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
    <Accordion type="single" collapsible className="w-full">
      {category.items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="border-b first:pt-0 pt-4">
          <AccordionTrigger className="text-left text-base font-medium  hover:no-underline">
            {item.question}
          </AccordionTrigger>

          <AccordionContent className="text-sm  leading-relaxed">{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
