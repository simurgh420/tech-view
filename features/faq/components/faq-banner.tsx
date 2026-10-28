import Image from 'next/image';

export function FaqBanner() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
      <Image
        src="/faq/faqbaner.png"
        alt="سوالات متداول"
        width={1016}
        height={420}
        className="w-full object-cover"
        priority
      />
    </div>
  );
}
