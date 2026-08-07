'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, Check } from 'lucide-react';

export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: اتصال به API خبرنامه
    console.log('newsletter signup:', email);
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-foreground">عضویت در خبرنامه</h4>
      <p className="mb-4 text-sm leading-6 text-muted-foreground">
        جدیدترین تخفیف‌ها و اخبار محصولات را در ایمیل خود دریافت کنید.
      </p>

      <form onSubmit={handleSubmit} className="relative">
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted-foreground">
          <Mail size={16} />
        </span>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="آدرس ایمیل"
          required
          dir="ltr"
          suppressHydrationWarning
          className="
            h-11 w-full rounded-lg border border-border bg-background
            ps-10 pe-12 text-sm text-foreground shadow-sm
            placeholder:text-muted-foreground
            transition-colors
            focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
          "
          aria-label="آدرس ایمیل"
        />
        <button
          type="submit"
          aria-label="ثبت ایمیل"
          className="
            absolute inset-y-0 end-1.5 flex items-center justify-center
            rounded-md px-2 text-primary transition-colors
            hover:bg-primary/10
          "
        >
          {submitted ? <Check size={16} /> : <ArrowLeft size={16} />}
        </button>
      </form>
    </div>
  );
}
