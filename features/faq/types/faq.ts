export type FAQItem = {
  question: string;
  answer: string;
};

export type FAQCategory = {
  id: string;
  title: string;
  items: FAQItem[];
};
