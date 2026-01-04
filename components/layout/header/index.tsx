import { auth } from '@/lib/auth';
import { Logo } from './Logo';
import { MegaMenu } from './MegaMenu';
import { NavLinks } from './NavLinks';
import { UserActions } from './UserActions';
import { headers } from 'next/headers';

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="relative w-full border-b bg-background">
      <div className="container grid grid-cols-[auto_1fr_auto] items-center py-4 gap-4">
        <Logo />
        <div className="flex justify-center">
          <NavLinks />
          <MegaMenu />
        </div>
        <UserActions session={session} />
      </div>
    </header>
  );
}
