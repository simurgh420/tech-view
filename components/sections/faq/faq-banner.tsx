import Image from 'next/image';

export function FaqBanner() {
  return (
    <div className="overflow-hidden rounded-2xl shadow-lg">
      <Image
        src="/faq/faqbaner.png"
        alt="سوالات متداول"
        width={1016}
        height={420}
        className="object-cover"
        priority
      />
    </div>
  );
}
