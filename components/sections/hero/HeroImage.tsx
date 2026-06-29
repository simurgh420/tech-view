'use client';

import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Link from 'next/link';

const slides = [
  {
    title: 'لپ‌تاپ‌ها',
    image: '/img/hero/hero-laptop.png',
    href: '/products/category/laptop',
  },
  {
    title: 'گوشی‌های هوشمند',
    image: '/img/hero/hero-phone.png',
    href: '/products/category/mobile',
  },
  {
    title: 'اسمارت‌ واچ‌ها',
    image: '/img/hero/hero-watch.png',
    href: '/products/category/smartwatch',
  },
];

export function HeroImage() {
  return (
    <div className="relative flex justify-center items-center">
      {/* Glow Background */}
      <div
        className="
    absolute inset-0
    bg-linear-to-br from-purple-600/40 via-blue-600/30 to-indigo-700/40
    blur-[120px]
    scale-[1.6]
    rounded-full
    animate-pulse-slow
  "
      />

      <Carousel
        className="w-182"
        opts={{
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 3000, // هر ۳ ثانیه اسلاید بعدی
            stopOnInteraction: false,
          }),
        ]}
      >
        <CarouselContent>
          {slides.map((slide, i) => (
            <CarouselItem key={i}>
              <Link href={slide.href} className="block group">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  width={728}
                  height={443}
                  className="rounded-xl drop-shadow-xl transition-transform duration-500 group-hover:scale-[1.03]"
                  priority={i === 0}
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
