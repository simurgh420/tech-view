import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { UserActions } from './UserActions';

export function Header() {
  return (
    <header className="w-full border-b bg-background">
      <div className="container grid grid-cols-[auto_1fr_auto] items-center py-4 gap-4">
        <Logo />
        <div className="flex justify-center">
          <NavLinks />
        </div>
        <UserActions isLoggedIn={false} />
      </div>
    </header>
  );
}
