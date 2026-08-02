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
      {/* تغییر ساختار از Grid به Flex */}
      <div className="container flex items-center justify-between gap-4 py-4">
        {/* سمت راست: دکمه‌های کاربری */}
        <UserActions session={session} />

        {/* سمت چپ: منو و لوگو با هم گروه شدند */}
        <div className="flex items-center gap-6 lg:gap-10">
          <NavLinks />
          <Logo />
        </div>
      </div>
    </header>
  );
}
