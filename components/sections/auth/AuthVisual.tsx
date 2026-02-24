import Image from 'next/image';

export function AuthVisual() {
  return (
    <div className="relative md:basis-3/4 h-screen">
      <Image
        src="/img/auth/cover.jpg"
        alt="Login visual"
        width={3500}
        height={400}
        priority
        className="object-cover"
      />
    </div>
  );
}
