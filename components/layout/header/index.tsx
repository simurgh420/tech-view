import { Logo } from './Logo';
import { MegaMenu } from './MegaMenu';
import { NavLinks } from './NavLinks';
import { UserActions } from './UserActions';

export function Header() {
  return (
    <header className="relative w-full border-b bg-background">
      <div className="container grid grid-cols-[auto_1fr_auto] items-center py-4 gap-4">
        <Logo />
        <div className="flex justify-center">
          <NavLinks />
          <MegaMenu />
        </div>
        <UserActions />
      </div>
    </header>
  );
}
