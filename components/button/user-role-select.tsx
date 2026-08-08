'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Shield, ShieldCheck, UserCog, Loader2 } from 'lucide-react';

import type { UserRole } from '@/types/user';
import { setUserRoleAction } from '@/services/action/user/setUserRoleAction';
import { useNotify } from '@/hooks/useNotify';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserRoleSelectProps {
  userId: string;
  role: UserRole;
  disabled?: boolean;
}

const ROLE_CONFIG = {
  USER: {
    label: 'کاربر',
    icon: UserCog,
  },
  ADMIN: {
    label: 'مدیر',
    icon: Shield,
  },
  SUPER_ADMIN: {
    label: 'مدیر ارشد',
    icon: ShieldCheck,
  },
} satisfies Record<UserRole, { label: string; icon: typeof UserCog }>;

export const UserRoleSelect = ({ userId, role, disabled = false }: UserRoleSelectProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const notify = useNotify();

  const currentRole = ROLE_CONFIG[role];

  async function handleChange(newRole: string) {
    if (newRole === role) return;

    setIsPending(true);

    try {
      const res = await setUserRoleAction(userId, newRole as UserRole);

      if (res.error) {
        notify.error(res.error);
        return;
      }

      notify.success('نقش با موفقیت بروزرسانی شد');
      router.refresh();
    } catch {
      notify.error('خطا در تغییر نقش');
    } finally {
      setIsPending(false);
    }
  }

  if (role === 'SUPER_ADMIN') {
    return (
      <div
        dir="rtl"
        className="
        ml-auto
        flex
        h-9
        w-35
        items-center
        justify-between
        rounded-lg
        border
        border-primary/20
        bg-primary/5
        px-3
        text-sm
        font-medium
        text-primary
      "
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 shrink-0" />
          <span>مدیر ارشد</span>
        </div>
      </div>
    );
  }
  const Icon = currentRole.icon;

  return (
    <Select value={role} onValueChange={handleChange} disabled={disabled || isPending}>
      <SelectTrigger
        dir="rtl"
        className="
          h-9 w-35
          rounded-lg
          border-border/70
          bg-background
          px-3
          shadow-none
          transition-all
          hover:border-primary/40
          hover:bg-muted/40
          focus:ring-2
          focus:ring-primary/15
          focus:ring-offset-0
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {isPending ? (
          <div className="flex w-full items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span>در حال تغییر...</span>
            </span>
          </div>
        ) : (
          <SelectValue>
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-muted-foreground" />
              <span className="font-medium">{currentRole.label}</span>
            </div>
          </SelectValue>
        )}
      </SelectTrigger>

      <SelectContent dir="rtl" align="end" className="min-w-45 rounded-xl p-1.5">
        <SelectItem value="USER" className="cursor-pointer rounded-lg py-2.5 pr-3 pl-8">
          <div className="flex items-center gap-2">
            <UserCog className="size-4 text-muted-foreground" />

            <div className="flex flex-col items-start">
              <span className="font-medium">کاربر</span>
              <span className="text-xs text-muted-foreground">دسترسی عادی</span>
            </div>
          </div>
        </SelectItem>

        <SelectItem value="ADMIN" className="cursor-pointer rounded-lg py-2.5 pr-3 pl-8">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-muted-foreground" />

            <div className="flex flex-col items-start">
              <span className="font-medium">مدیر</span>
              <span className="text-xs text-muted-foreground">دسترسی مدیریتی</span>
            </div>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
