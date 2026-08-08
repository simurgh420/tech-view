import Link from 'next/link';

const LEGAL_LINKS = [
  { label: 'حریم خصوصی', href: '/privacy' },
  { label: 'قوانین و مقررات', href: '/terms' },
] as const;

export function FooterBottom() {
  const year = new Date().getFullYear();

  return (
    <div className="flex flex-col items-center justify-between gap-2 py-4 text-xs md:flex-row">
      <p className="text-muted-foreground">© {year} TechView. تمامی حقوق محفوظ است.</p>

      <div className="flex items-center gap-4">
        {LEGAL_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
