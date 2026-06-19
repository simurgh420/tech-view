import Image from 'next/image';

export function HeroImage() {
  return (
    <div className="flex justify-center">
      <Image
        src="/img/hero/heroimg.png"
        alt="Modern laptops"
        width={728}
        height={443}
        loading="eager"
        className="drop-shadow-xl"
      />
    </div>
  );
}
