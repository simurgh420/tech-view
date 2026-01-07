import { ContactCards } from '@/components/sections/contact/ContactCards';
import { ContactForm } from '@/components/sections/contact/ContactForm';
import { ContactHeader } from '@/components/sections/contact/ContactHeader';
import { ContactInfo } from '@/components/sections/contact/ContactInfo';

export default function ContactPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16 space-y-20">
      <ContactHeader />
      <ContactCards />

      {/* Contact Form + Contact Info side by side */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* فرم دو ستون فضا بگیرد */}
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        {/* اطلاعات تماس ستون سوم */}
        <div className="lg:col-span-1">
          <ContactInfo />
        </div>
      </section>
    </main>
  );
}
