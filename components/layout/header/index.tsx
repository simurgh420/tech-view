import { auth } from '@/lib/auth';
import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { UserActions } from './UserActions';
import { headers } from 'next/headers';

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4">
        <Logo />

        <div className="flex justify-center">
          {/* MegaMenu حالا در دل NavLinks رندر می‌شود */}
          <NavLinks />
        </div>

        <UserActions session={session} />
      </div>
    </header>
  );
}
