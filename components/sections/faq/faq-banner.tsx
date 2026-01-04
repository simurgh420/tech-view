import Image from 'next/image';

export function FaqBanner() {
  return (
    <div className="relative w-full h-48 md:h-90 rounded-xl overflow-hidden shadow-sm">
      <Image
        src="/faq/faqbaner.png"
        alt="FAQ Banner"
        width={1016}
        height={420}
        className="object-cover"
        priority
      />
    </div>
  );
}
