import { Button } from '@/components/ui';
import { ShoppingCart, Search, User } from 'lucide-react';

export function UserActions({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <Search className="size-5 cursor-pointer" />
      <ShoppingCart className="size-5 cursor-pointer" />
      {isLoggedIn ? (
        <User className="size-6 cursor-pointer text-muted-foreground" />
      ) : (
        <Button size="sm">ورود / ثبت‌نام</Button>
      )}
    </div>
  );
}
