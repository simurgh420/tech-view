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
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border-b border-white/10 py-3"
        >
          <AccordionTrigger
            className="
    flex flex-row-reverse
    items-center
    justify-between
    text-base
    font-medium
    dark:text-[oklch(90%_0.01_270)]
        text-black
    hover:no-underline
    hover:text-shadow-black
  "
          >
            {item.question}
          </AccordionTrigger>

          <AccordionContent className="text-sm leading-relaxed  pr-2 animate-in fade-in slide-in-from-top-1">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
