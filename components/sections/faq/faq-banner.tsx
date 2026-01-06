import Image from 'next/image';

export function FaqBanner() {
  return (
    <div className=" overflow-hidden rounded-2xl">
      <Image
        src="/faq/faqbaner.png"
        alt="FAQ Banner"
        width={1016}
        height={420}
        className=" object-cover"
        priority
      />
    </div>
  );
}
