import { auth } from '@/lib/auth';
import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { UserActions } from './UserActions';
import { MobileMenu } from './MobileMenu';
import { headers } from 'next/headers';

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex items-center justify-between gap-2 py-3 lg:gap-4 lg:py-4">
        <UserActions session={session} />

        <div className="flex items-center gap-1 lg:gap-10">
          <NavLinks />
          <MobileMenu />
          <Logo />
        </div>
      </div>
    </header>
  );
}
