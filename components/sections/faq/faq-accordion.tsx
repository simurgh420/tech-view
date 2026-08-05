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
          <AccordionTrigger
            className="
              flex flex-row-reverse
              items-center
              justify-between
              text-base
              font-medium
              text-foreground
              hover:text-primary
              hover:no-underline
            "
          >
            {item.question}
          </AccordionTrigger>

          <AccordionContent className="animate-in fade-in slide-in-from-top-1 pr-2 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
