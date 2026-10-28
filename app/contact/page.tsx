import { ContactCards } from '@/features/contact/components/ContactCards';
import { ContactForm } from '@/features/contact/components/ContactForm';
import { ContactHeader } from '@/features/contact/components/ContactHeader';
import { ContactInfo } from '@/features/contact/components/ContactInfo';

export default function ContactPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16 space-y-20">
      <ContactHeader />
      <ContactCards />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        <div className="lg:col-span-1">
          <ContactInfo />
        </div>
      </section>
    </main>
  );
}
