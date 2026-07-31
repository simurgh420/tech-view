import Link from 'next/link';

const LEGAL_LINKS = [
  { label: 'حریم خصوصی', href: '/privacy' },
  { label: 'قوانین و مقررات', href: '/terms' },
  { label: 'تنظیمات کوکی', href: '/cookie-settings' },
];

export function FooterBottom() {
  const year = new Date().getFullYear();

  return (
    <div className="w-full border-t border-white/5 px-4 py-4 text-xs sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="text-center text-neutral-500 md:text-right" dir="ltr">
          © {year} TechView
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:justify-start">
          {LEGAL_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-neutral-500 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
