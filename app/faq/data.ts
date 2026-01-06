import type { FAQCategory } from '@/types/faq';

export const faqData: FAQCategory[] = [
  {
    id: 'general',
    title: 'General',
    items: [
      {
        question: 'Can I purchase products from Tech Heim using installment payments?',
        answer:
          'Yes, Tech Heim offers the option to purchase products using both cash and installment payments.',
      },
      {
        question: 'How can I engage with the magazine content on Tech Heim?',
        answer: 'You can actively engage by leaving comments and participating in the Q&A section.',
      },
      {
        question: 'Does Tech Heim offer a warranty on its products?',
        answer:
          'Yes, Tech Heim provides a warranty on all eligible products. Details vary by manufacturer.',
      },
    ],
  },
  {
    id: 'trust',
    title: 'Trust & Safety',
    items: [
      {
        question: 'Is Tech Heim a secure platform for online shopping?',
        answer:
          'Yes, Tech Heim uses secure protocols and provides warranties on eligible products.',
      },
    ],
  },
  {
    id: 'services',
    title: 'Services',
    items: [
      {
        question: 'How can I get assistance with my purchase or any other inquiries?',
        answer: 'You can reach out to our support team via the contact page. We’re here to help.',
      },
    ],
  },
];
