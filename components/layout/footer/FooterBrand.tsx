import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { SocialIcons } from './SocialIcons';

export function FooterBrand() {
  return (
    <div className="space-y-4">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-xs font-black">TV</span>
        </div>
        <span className="text-base font-bold text-foreground">TechView</span>
      </Link>

      <p className="max-w-xs text-xs leading-6 text-muted-foreground">
        مرجع تخصصی خرید محصولات تکنولوژی، همراه با مشاوره و آموزش‌های به‌روز دنیای دیجیتال.
      </p>

      <ul className="space-y-2 text-xs text-muted-foreground">
        <li className="flex items-center gap-2">
          <MapPin size={13} className="shrink-0 text-primary" />
          <span>تهران، خیابان ...</span>
        </li>

        <li className="flex items-center gap-2">
          <Phone size={13} className="shrink-0 text-primary" />
          <span dir="ltr">+98 936 876 6577</span>
        </li>

        <li className="flex items-center gap-2">
          <Mail size={13} className="shrink-0 text-primary" />
          <span dir="ltr">mohamadrezah420@gmail.com</span>
        </li>
      </ul>

      <SocialIcons />
    </div>
  );
}
