import Image from 'next/image';

export function AuthVisual() {
  return (
    <div className="relative md:basis-3/4 h-screen">
      <Image src="/img/auth/cover.jpg" alt="Login visual" fill priority className="object-cover" />
    </div>
  );
}
